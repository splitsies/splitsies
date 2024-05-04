import React, { useEffect, useMemo, useRef } from "react"
import { Dimensions, Pressable, SafeAreaView, StyleSheet } from "react-native"
import { Colors, Text, TouchableOpacity, View } from "react-native-ui-lib/core"
import { SpThemedComponent } from "../hocs/SpThemedComponent"
import { useInitialize } from "../hooks/use-initialize";
import { PanGesture } from "react-native-gesture-handler/lib/typescript/handlers/gestures/panGesture";
import { Directions, FlingGestureHandler, Gesture, GestureDetector, PanGestureHandler } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { FlingGesture } from "react-native-gesture-handler/lib/typescript/handlers/gestures/flingGesture";
import { IPushMessage } from "../models/push-message/push-message-interface";

type Props = {
    visible: boolean;
    onPress?: (() => void) | (() => Promise<void>);
    message: IPushMessage | undefined;
}

export const BannerNotification2 = SpThemedComponent(({ visible, onPress }) => {
    const windowHeight = useMemo(() => Dimensions.get("window").height, [Dimensions]);
    // const popAnim = useRef(new Animated.Value(windowHeight * -1));
    const yPosition = useSharedValue<number>(windowHeight * -1);
    // const transX = useRef(new Animated.Value(0)).current;
    // const transY = useRef(new Animated.Value(0)).current;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: yPosition.value }]
        }
    });
    

    useInitialize(() => {
        popIn();
        // setTimeout(() => {
        //     console.log(windowHeight);
        //     console.log();
        //     popIn();
        // }, 1000);
    });

    const popOut = () => {
        // setTimeout(() => {
        //     Animated.timing(popAnim.current, {
        //         toValue: windowHeight * -1,
        //         duration: 750,
        //         useNativeDriver: true,
        //     }).start();
        // }, 5000);
        setTimeout(() => {
            yPosition.value = withTiming(windowHeight * -1, { duration: 750 });
        }, 3000);
    };

    const popIn = () => {
        // Animated.spring(popAnim.current, {
        //     toValue: 0,
        //     // speed: 7,
        //     bounciness: 7,
        //     useNativeDriver: true,
        // }).start(popOut);
        console.log("popping");
        // yPosition.value = withSpring(0, { duration: 250 }, () => console.log("pop in complete"));
        yPosition.value = withTiming(100);
        popOut();
    };

    const onNotificationPress = () => {
        onPress?.();
        // Animated.timing(popAnim.current, {
        //     toValue: windowHeight * -1,
        //     duration: 250,
        //     useNativeDriver: true,
        // }).start();
    };

    const flingGesture = Gesture.Fling()
        .direction(Directions.UP)
        .onStart((e) => {
            console.log("swiped!");
            // runOnJS(() => {
            //     Animated.timing(popAnim.current, {
            //         toValue: windowHeight * -1,
            //         duration: 250,
            //         useNativeDriver: true,
            //     }).start();
            // })();
        });


    return (
        <SafeAreaView style={{
            position: "absolute", zIndex: Number.MAX_SAFE_INTEGER, top: 0, left: 0, width: "100%"
        }}>
            {/* <GestureDetector gesture={flingGesture}> */}
                    <Animated.View style={[{
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
                    animatedStyle
            ]}>
                <TouchableOpacity activeOpacity={0.9} onPress={onNotificationPress}>
                    <Text bodyBold ellipsizeMode="tail" numberOfLines={1}>You're being invited! You're being invited! You're being invited! You're being invited! You're being invited!</Text>
                    <Text marginT-5 body ellipsizeMode="tail" numberOfLines={2}>This is your message You're being invited! You're being invited! You're being invited! You're being invited! You're being invited! You're being invited! You're being invited! You're being invited! You're being invited!</Text>
            
                </TouchableOpacity>
            </Animated.View>
            {/* </GestureDetector> */}
        </SafeAreaView>
    );
});




export const BannerNotification = SpThemedComponent(({ visible, onPress, message }: Props) => {
    const hiddenOffset = useMemo(() => -1 * Dimensions.get("window").height, [Dimensions]);
    const yPosition = useSharedValue<number>(hiddenOffset);
  
    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: yPosition.value }],
    }));
      
    useInitialize(() => {
        show();
        // setTimeout(hide, 1500);
    });

    useEffect(() => {
        if (visible) { show(); }
        else { hide(); }
    }, [visible]);

    const hide = () => {
        yPosition.value = withTiming(hiddenOffset, { duration: 750 });
    };

    const show = () => {
        yPosition.value = withSpring(0, { damping: 15});
    };

    const dismiss = Gesture.Fling()
        .direction(Directions.UP)
        .onStart(runOnJS(hide));
    
    const open = Gesture.Tap()
        .onEnd(() => {
            console.log("opened");
            onPress?.();
            runOnJS(hide)();
        });
    
    const gestureHandler = Gesture.Simultaneous(dismiss, open);
    
    return (
        <SafeAreaView style={styles.notificationContainer}>
            <GestureDetector gesture={gestureHandler}>
                <Animated.View style={[styles.box, style]}>
                    <TouchableOpacity activeOpacity={0.9}>
                        {message?.notification &&
                            <View>
                            <Text bodyBold ellipsizeMode="tail" numberOfLines={1}>
                                {message.notification.title}
                            </Text>
                            <Text marginT-5 body ellipsizeMode="tail" numberOfLines={2}>
                                {message.notification.body}
                                </Text>
                            </View>
                        }
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </SafeAreaView>
    );
});
  
const styles = StyleSheet.create({
    notificationContainer: {
        position: "absolute", zIndex: Number.MAX_SAFE_INTEGER, top: 0, left: 0, width: "100%"
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