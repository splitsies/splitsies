
import { Colors, Text, View } from "react-native-ui-lib";
import Tooltip, { TooltipProps } from "react-native-walkthrough-tooltip";
import Close from "../../assets/icons/close.svg";
import TipsOff from "../../assets/icons/tips-off.svg";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { lazyInject } from "../utils/lazy-inject";
import { ITutorialManager } from "../managers/tutorial-manager/tutorial-manager.i";
import { useTutorialState } from "../hooks/use-tutorial-state";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { useComputed } from "../hooks/use-computed";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Alert, Platform, Pressable, StatusBar } from "react-native";
import Next from "../../assets/icons/next.svg";
import { TutorialGroup } from "../models/tutorial-group";
import { ITutorialConfiguration } from "../models/configuration/tutorial-configuration/tutorial-configuration.i";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { TutorialStep } from "../models/tutorial-step";
import { useThemeWatcher } from "../hooks/use-theme-watcher";

type Props = TooltipProps & {
    children: React.ReactNode;
    group: TutorialGroup;
    stepKey: string;
    renderOnLayout?: boolean;
};

const _tutorialConfig = lazyInject<ITutorialConfiguration>(ITutorialConfiguration);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _tutorialManager = lazyInject<ITutorialManager>(ITutorialManager);

export const TutorialTip = SpThemedComponent((props: Props) => {
    const theme = useThemeWatcher();
    const tutorialState = useTutorialState();
    const [stepIndex] = useState<number>(_tutorialConfig.groups[props.group].findIndex(s => s.key === props.stepKey));
    const [visible, setVisible] = useState<boolean>(false);
    const step = useComputed(([index]) => _tutorialConfig.groups[props.group][index as number], [stepIndex]);
    const isLastStep = useComputed(([steps]) => stepIndex === (steps as TutorialStep[]).length - 1, [_tutorialConfig.groups[props.group]])

    useEffect(() => {
        const updatedVisible = !tutorialState.disabled && tutorialState.stepState[props.group] === stepIndex;

        // Need to time the visible flag updates so that a previous tooltip's modal can be hidden first.
        if (updatedVisible && props.renderOnLayout) {
            setTimeout(() => setVisible(updatedVisible), 450);
        } else if (updatedVisible) {
            requestAnimationFrame(() => setVisible(updatedVisible));
        } else {
            setVisible(updatedVisible);
        }
    }, [tutorialState, stepIndex]);

    const onDisablePress = useCallback(() => {
        Alert.alert(`Turn off Tips?`, "These will help guide you through using Splitsies. Are you sure you want to disable?", [
            {
                text: "Yes",
                onPress: () => void _tutorialManager.disableTutorial(),
            },
            { text: "No", style: "cancel" },
        ]);
    }, []);

    const onNext = useCallback(async () => {
        await _tutorialManager.set(props.group, stepIndex + 1);
    }, [stepIndex]);
    
    return (
        <Tooltip
            isVisible={visible}
            disableShadow
            childContentSpacing={-1}
            displayInsets={{ top: 24, bottom: 24, left: 5, right: 5}}
            showChildInTooltip={true}
            backgroundColor={theme === "dark" ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0)"}
            closeOnContentInteraction={false}
            contentStyle={{ borderRadius: 15, paddingHorizontal: 15, paddingBottom: 38, borderWidth: 1, borderColor: Colors.divider, backgroundColor: Colors.primary }}
            arrowStyle={{ marginTop: props.placement === "bottom" ? 0 : -15 }}
            arrowSize={{width: 30, height: 15}}
            content={
                <View>
                    <View style={{ marginTop: 10, display: "flex", columnGap: 12, flexGrow: 1, justifyContent: "flex-end", alignItems: "center", flexDirection: "row" }}>
                        <Pressable onPress={onDisablePress}>
                            <TipsOff
                                width={_uiConfig.sizes.icon - 7}
                                height={_uiConfig.sizes.icon - 7}
                                fill={Colors.black}
                            />
                        </Pressable>
                        <Pressable onPress={onNext}>
                            {isLastStep ? 
                                <Close
                                    width={_uiConfig.sizes.icon - 4}
                                    height={_uiConfig.sizes.icon - 4}
                                    fill={Colors.black}
                                /> :
                                <Next
                                    width={_uiConfig.sizes.icon - 2}
                                    height={_uiConfig.sizes.icon - 2}
                                    fill={Colors.black}
                                /> 
                            }
                        </Pressable>
                    </View>
                    <Text black style={{ marginTop: 5 }}>{step.message}</Text>
                </View>
            }
            {...props}
                onClose={onNext}
            >
        
                {props.children}
            </Tooltip>
    );

});