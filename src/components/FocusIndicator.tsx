import React from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useInitialize } from "../hooks/use-initialize";
import { StyleSheet } from "react-native";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const boxSize = 80;
const initialBoxSize = 120;
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    x: number;
    y: number;
};

export const FocusIndicator = ({ x, y }: Props) => {
    const size = useSharedValue(initialBoxSize);
    const translate = useSharedValue(0);

    useInitialize(() => {
        size.value = boxSize;
        translate.value = (initialBoxSize - boxSize) / 2;

        return () => {
            size.value = initialBoxSize;
        };
    });

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ translateX: withSpring(translate.value) }, { translateY: withSpring(translate.value) }],
        width: withSpring(size.value),
        height: withSpring(size.value),
    }));

    return (
        <Animated.View
            style={[
                styles.boxStyle,
                animatedStyles,
                {
                    top: y - initialBoxSize / 2,
                    left: x - initialBoxSize / 2,
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    boxStyle: {
        borderRadius: 12,
        position: "absolute",
        borderWidth: 2,
        borderColor: _colorConfiguration.primary,
    },
});
