import { useState } from "react";
import { ITutorialManager } from "../managers/tutorial-manager/tutorial-manager.i"
import { TutorialState } from "../models/tutorial-state";
import { lazyInject } from "../utils/lazy-inject"
import { useInitialize } from "./use-initialize";
import { zip } from "rxjs";

const _tutorialManager = lazyInject<ITutorialManager>(ITutorialManager);

export const useTutorialState = () => {
    const [tutorialState, setTutorialState] = useState<TutorialState>(_tutorialManager.state);

    useInitialize(() => {
        const sub = zip(_tutorialManager.showTutorial$, _tutorialManager.tutorialStep$).subscribe({
            next: ([tutorialDisabled, tutorialStep]) =>
                setTutorialState(new TutorialState(tutorialDisabled, tutorialStep))
        });

        return () => sub.unsubscribe();
    });

    return tutorialState;
}