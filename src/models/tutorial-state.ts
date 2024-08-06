import { TutorialGroup } from "./tutorial-group";

export class TutorialState {
    constructor(readonly disabled: boolean, readonly stepState: Record<TutorialGroup, number>) {}
}
