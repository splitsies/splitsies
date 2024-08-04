import { ITutorialConfiguration } from "./tutorial-configuration.i";
import { tutorialConfig } from "../../../config/tutorial.config";
import { TutorialStep } from "../../tutorial-step";
import { TutorialGroup } from "../../tutorial-group";
import { injectable } from "inversify";

@injectable()
export class TutorialConfiguration implements ITutorialConfiguration {
    readonly groups: Record<TutorialGroup, TutorialStep[]>;

    constructor() {
        this.groups = tutorialConfig;
    }
}