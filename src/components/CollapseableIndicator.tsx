import React, { useEffect } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import Expand from "../../assets/icons/expand.svg";
import { Colors } from "react-native-ui-lib/core";

type Props = {
    collapsed: boolean;
    size: number;
};

export const CollapseableIndicator = ({ collapsed, size }: Props) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withSpring(collapsed ? 0 : -180, { damping: 10 });
    }, [collapsed]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${rotation.value}deg` }],
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            <Expand width={size} height={size} fill={Colors.textColor} />
        </Animated.View>
    );
};
