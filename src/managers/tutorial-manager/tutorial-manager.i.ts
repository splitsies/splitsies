import { Observable } from "rxjs";
import { TutorialState } from "../../models/tutorial-state";

export interface ITutorialManager {
    readonly tutorialStep$: Observable<number>;
    readonly showTutorial$: Observable<boolean>;
    readonly state: TutorialState;
    disableTutorial(): Promise<void>;
    advance(): Promise<void>;
    back(): Promise<void>;
}
export const ITutorialManager = Symbol.for("ITutorialManager");