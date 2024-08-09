import AsyncStorage from "@react-native-async-storage/async-storage";
import { injectable } from "inversify";
import { BehaviorSubject, Observable } from "rxjs";
import { ITutorialManager } from "./tutorial-manager.i";
import { TutorialState } from "../../models/tutorial-state";
import { lazyInject } from "../../utils/lazy-inject";
import { ITutorialConfiguration } from "../../models/configuration/tutorial-configuration/tutorial-configuration.i";
import { TutorialGroup } from "../../models/tutorial-group";
import { BaseManager } from "../base-manager";

@injectable()
export class TutorialManager extends BaseManager implements ITutorialManager {
    private readonly _tutorialConfiguration = lazyInject<ITutorialConfiguration>(ITutorialConfiguration);
    private readonly _tutorialDisabled$ = new BehaviorSubject<boolean>(false);
    private readonly _state$ = new BehaviorSubject<Record<TutorialGroup, number>>({
        home: 0,
        expense: 0,
        editItem: 0,
        people: 0,
        contacts: 0,
        guests: 0,
        search: 0,
    });

    get state$(): Observable<Record<TutorialGroup, number>> {
        return this._state$.asObservable();
    }

    get tutorialDisabled$(): Observable<boolean> {
        return this._tutorialDisabled$.asObservable();
    }

    get state(): TutorialState {
        return new TutorialState(this._tutorialDisabled$.value, this._state$.value);
    }

    protected async initialize(): Promise<void> {
        const disabled = await AsyncStorage.getItem("tutorialDisabled");
        this._tutorialDisabled$.next(disabled === "true");

        const value = await AsyncStorage.getItem("tutorialState");
        if (!value) return;

        const state = { ...this._state$.value };
        const savedState = JSON.parse(value) as Record<TutorialGroup, number>;
        for (const group of Object.keys(state)) {
            state[group as TutorialGroup] = savedState[group as TutorialGroup] ?? 0;
        }

        this._state$.next(state);
    }

    async reset(): Promise<void> {
        await AsyncStorage.removeItem("tutorialState");
        await AsyncStorage.removeItem("tutorialDisabled");
    }

    async disableTutorial(): Promise<void> {
        await AsyncStorage.setItem("tutorialDisabled", "true");
        this._tutorialDisabled$.next(true);
    }

    async set(group: TutorialGroup, index: number): Promise<void> {
        if (index < 0 || index > this._tutorialConfiguration.groups[group].length) return;

        const updatedState = { ...this._state$.value };
        updatedState[group] = index;

        await AsyncStorage.setItem("tutorialState", JSON.stringify(updatedState));
        this._state$.next(updatedState);
    }
}
