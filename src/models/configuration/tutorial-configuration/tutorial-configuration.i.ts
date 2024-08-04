import { TutorialGroup } from "../../tutorial-group";
import { TutorialStep } from "../../tutorial-step";

export interface ITutorialConfiguration {
    readonly groups: Record<TutorialGroup, TutorialStep[]>;
}
export const ITutorialConfiguration = Symbol.for("ITutorialConfiguration");
