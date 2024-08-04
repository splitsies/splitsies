import AsyncStorage from "@react-native-async-storage/async-storage";
import { injectable } from "inversify";
import { BehaviorSubject, Observable } from "rxjs";
import { tutorialConfig } from "../../config/tutorial.config";
import { ITutorialManager } from "./tutorial-manager.i";
import { TutorialState } from "../../models/tutorial-state";
import { lazyInject } from "../../utils/lazy-inject";
import { ITutorialConfiguration } from "../../models/configuration/tutorial-configuration/tutorial-configuration.i";
import { TutorialGroup } from "../../models/tutorial-group";

@injectable()
export class TutorialManager implements ITutorialManager {
    private readonly _tutorialConfiguration = lazyInject<ITutorialConfiguration>(ITutorialConfiguration);
    private readonly _tutorialDisabled$ = new BehaviorSubject<boolean>(false);
    private readonly _state$ = new BehaviorSubject<Record<TutorialGroup, number>>({ home: 4, expense: 0, editItem: 0 });

    get state$(): Observable<Record<TutorialGroup, number>> {
        return this._state$.asObservable();
    }

    get tutorialDisabled$(): Observable<boolean> {
        return this._tutorialDisabled$.asObservable();
    }

    get state(): TutorialState {
        return new TutorialState(this._tutorialDisabled$.value, this._state$.value);
    }

    constructor() {
        // AsyncStorage.getItem("tutorialDisabled").then((value) => {
        //     this._tutorialDisabled$.next(value === "true") 
        // });

        // AsyncStorage.getItem("tutorialStep").then((value) => {
        //     let step = tutorialConfig.steps.length;
        //     if (!value) {
        //         this._tutorialStep$.next(step);
        //         return;
        //     }

        //     step = parseInt(value);
        //     if (isNaN(step)) {
        //         this._tutorialStep$.next(step)
        //         return;
        //     }

        //     this._tutorialStep$.next(step)
        // });
    }

    async disableTutorial(): Promise<void> {
        // await AsyncStorage.setItem("tutorialDisabled", "true");
        this._tutorialDisabled$.next(true);
    }

    async advance(): Promise<void> {
        // if (this._groupSteps$.value >= tutorialConfig.steps.length) return;

        // // await AsyncStorage.setItem("tutorialStep", `${this._tutorialStep$.value + 1}`);
        // console.log("going one more");
        // this._groupSteps$.next(this._groupSteps$.value + 1);
    }

    async set(group: TutorialGroup, index: number): Promise<void> {
        if (index < 0 || index > this._tutorialConfiguration.groups[group].length) return;

        const updatedState = { ...this._state$.value };
        updatedState[group] = index;

        JSON.stringify(updatedState);

        // await AsyncStorage.setItem("tutorialState", updatedState);
        console.log("going one more");
        this._state$.next(updatedState);
    }

    async back(): Promise<void> {
        // if (this._state$.value <= 0) return;

        // await AsyncStorage.setItem("tutorialStep", `${this._state$.value - 1}`);
        // this._state$.next(this._state$.value - 1);
    }
}