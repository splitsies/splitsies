import { useState } from "react";
import { ITutorialManager } from "../managers/tutorial-manager/tutorial-manager.i"
import { TutorialState } from "../models/tutorial-state";
import { lazyInject } from "../utils/lazy-inject"
import { useInitialize } from "./use-initialize";

const _tutorialManager = lazyInject<ITutorialManager>(ITutorialManager);

export const useTutorialState = () => {
    const [tutorialState, setTutorialState] = useState<TutorialState>(_tutorialManager.state);

    useInitialize(() => {
        const sub = _tutorialManager.state$.subscribe({
            next: (state) => {
                setTutorialState(new TutorialState(tutorialState.disabled, state))
            }
        });

        sub.add(_tutorialManager.tutorialDisabled$.subscribe({
            next: (disabled) => {
                setTutorialState(new TutorialState(disabled, tutorialState.stepState))
            }
        }));

        return () => sub.unsubscribe();
    });

    return tutorialState;
}