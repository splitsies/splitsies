import AsyncStorage from "@react-native-async-storage/async-storage";
import { injectable } from "inversify";
import { BehaviorSubject, Observable } from "rxjs";
import { tutorialConfig } from "../../config/tutorial.config";
import { ITutorialManager } from "./tutorial-manager.i";
import { TutorialState } from "../../models/tutorial-state";

@injectable()
export class TutorialManager implements ITutorialManager {
    private readonly _showTutorial$ = new BehaviorSubject<boolean>(true);
    private readonly _tutorialStep$ = new BehaviorSubject<number>(0);

    get tutorialStep$(): Observable<number> {
        return this._tutorialStep$.asObservable();
    }

    get tutorialStep(): number {
        return this._tutorialStep$.value;
    }

    get showTutorial$(): Observable<boolean> {
        return this._showTutorial$.asObservable();
    }

    get state(): TutorialState {
        return new TutorialState(this._showTutorial$.value, this._tutorialStep$.value);
    }

    constructor() {
        AsyncStorage.getItem("showTutorial").then((value) => {
            this._showTutorial$.next(value === "true") 
        });

        AsyncStorage.getItem("tutorialStep").then((value) => {
            let step = tutorialConfig.steps.length;
            if (!value) {
                this._tutorialStep$.next(step);
                return;
            }

            step = parseInt(value);
            if (isNaN(step)) {
                this._tutorialStep$.next(step)
                return;
            }

            this._tutorialStep$.next(step)
        });
    }

    async disableTutorial(): Promise<void> {
        await AsyncStorage.setItem("showTutorial", "false");
        this._showTutorial$.next(false);
    }

    async advance(): Promise<void> {
        if (this._tutorialStep$.value >= tutorialConfig.steps.length - 1) return;

        await AsyncStorage.setItem("tutorialStep", `${this._tutorialStep$.value + 1}`);
        this._tutorialStep$.next(this._tutorialStep$.value + 1);
    }

    async back(): Promise<void> {
        if (this._tutorialStep$.value <= 0) return;

        await AsyncStorage.setItem("tutorialStep", `${this._tutorialStep$.value - 1}`);
        this._tutorialStep$.next(this._tutorialStep$.value - 1);
    }
}