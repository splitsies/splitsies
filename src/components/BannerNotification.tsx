import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet } from "react-native";
import { Colors, Text, TouchableOpacity, View } from "react-native-ui-lib/core";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { IPushMessage } from "../models/push-message/push-message-interface";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";

const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = {
    visible: boolean;
    onPress?: (() => void) | (() => Promise<void>);
    message: IPushMessage | undefined;
};

export const BannerNotification = SpThemedComponent(({ visible, onPress, message }: Props) => {
    const hiddenOffset = useMemo(() => -0.5 * Dimensions.get("window").height, [Dimensions]);
    const yPosition = useSharedValue<number>(hiddenOffset);
    const [containerOffset, setContainerOffset] = useState<number>(hiddenOffset);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: yPosition.value }],
    }));

    useEffect(() => {
        if (visible) {
            show();
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        yPosition.value = withTiming(
            hiddenOffset,
            { duration: _uiConfig.durations.notificationDismissDurationMs, easing: Easing.out(Easing.quad) },
            () => {
                runOnJS(setContainerOffset)(hiddenOffset);
            },
        );
    };

    const show = () => {
        setContainerOffset(0);
        yPosition.value = withSpring(0, { damping: 15 });
    };

    const dismiss = Gesture.Fling().direction(Directions.UP).onStart(runOnJS(hide));

    const open = Gesture.Tap().onEnd(() => {
        runOnJS(hide)();

        if (onPress) {
            runOnJS(onPress)();
        }
    });

    const gestureHandler = Gesture.Simultaneous(dismiss, open);

    return (
        <SafeAreaView style={[styles.notificationContainer, { top: containerOffset }]}>
            <GestureDetector gesture={gestureHandler}>
                <Animated.View style={[styles.box, style]}>
                    <TouchableOpacity activeOpacity={0.9}>
                        {message?.notification && (
                            <View>
                                <Text bodyBold ellipsizeMode="tail" numberOfLines={1}>
                                    {message.notification.title}
                                </Text>
                                <Text marginT-3 body ellipsizeMode="tail" numberOfLines={2}>
                                    {message.notification.body}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    notificationContainer: {
        position: "absolute",
        zIndex: Number.MAX_SAFE_INTEGER,
        left: 0,
        width: "100%",
    },
    box: {
        backgroundColor: Colors.screenBG,
        borderRadius: 15,
        marginHorizontal: 15,
        marginTop: 10,
        maxHeight: 150,
        paddingHorizontal: 18,
        paddingVertical: 18,
        elevation: 10,
        shadowColor: Colors.divider,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 5,
        borderColor: Colors.divider,
        borderWidth: 1,
    },
});
