import { Observable } from "rxjs";
import { TutorialState } from "../../models/tutorial-state";
import { TutorialGroup } from "../../models/tutorial-group";
import { IBaseManager } from "../base-manager-interface";

export interface ITutorialManager extends IBaseManager {
    readonly state$: Observable<Record<TutorialGroup, number>>;
    readonly tutorialDisabled$: Observable<boolean>;
    readonly state: TutorialState;
    disableTutorial(): Promise<void>;
    advance(): Promise<void>;
    set(group: string, index: number): Promise<void>
    back(): Promise<void>;
    reset(): Promise<void>;
}
export const ITutorialManager = Symbol.for("ITutorialManager");