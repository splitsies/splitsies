import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import { Share, Platform, View, Pressable, TouchableOpacity, StyleSheet, PixelRatio } from "react-native";
import { Props } from "react-native-camera-kit/dist/CameraScreen";
import { ExpenseNavigationHeader } from "../components/ExpenseNavigatorHeader";
import { TutorialTip } from "../components/TutorialTip";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { useInitialize } from "../hooks/use-initialize";
import { useObservable } from "../hooks/use-observable";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { ExpenseGroupScreen } from "../screens/ExpenseGroupScreen";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { InviteNavigator } from "./InviteNavigator";
import Receipt from "../../assets/icons/receipt.svg";
import AddPerson from "../../assets/icons/add-person.svg";
import ShareIcon from "../../assets/icons/share.svg";
import People from "../../assets/icons/people.svg";
import Camera from "../../assets/icons/camera.svg";
import { PeopleGroupScreen } from "../screens/PeopleGroupScreen";
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Svg, { Path, SvgFromUri } from "react-native-svg";


// TODO: Hack, satisfy the unused component param
const C = () => {
    return null;
};

const RefCamera = React.forwardRef((props, ref) => {
    return <Camera ref={ref} />
})

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedCamera = Animated.createAnimatedComponent(RefCamera);





const Tab = createBottomTabNavigator();
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

/**
 * See https://github.com/react-navigation/react-navigation/issues/11353
 * There is an issue where the layouts will flicker on initial load.
 * Wrapping this in a drawer navigator seems to be a bandaid for the issue
 */
export const GroupExpenseNavigator = SpThemedComponent((_: Props) => {
    const currentExpense = useObservable(_expenseManager.currentExpense$, _expenseManager.currentExpense);

    const yPosition = useSharedValue<number>(22);
    const cameraButtonSize = useSharedValue<number>(75);
    const animatedCameraIconSize = useSharedValue<number>(_uiConfig.sizes.largeIcon);

    useEffect(() => {
        _expenseViewModel.setSelectedChild(undefined);
    }, []);


    const style = useAnimatedStyle(() => ({
        bottom: yPosition.value,
        width: cameraButtonSize.value,
        height: cameraButtonSize.value
    }));

    const iconSize = useAnimatedProps(() => ({
        width: animatedCameraIconSize.value,
        height: animatedCameraIconSize.value,
    }));

    useObservable(_expenseViewModel.screen$, "Items", (screen) => {
        yPosition.value = withSpring(screen === "People" ? -5 : 22, { duration: 800 });
        cameraButtonSize.value = withSpring(screen === "People" ? 41 : 75, { duration: 800 });
        animatedCameraIconSize.value = withSpring(screen === "People" ? _uiConfig.sizes.smallIcon : _uiConfig.sizes.largeIcon, { duration: 800 });
    });

    useInitialize(() => {
        void _userManager.requestUsersFromContacts();
        return () => {
            _expenseViewModel.resetState();
            _expenseManager.disconnectFromExpense();
        };
    });

    const onShare = async () => {
        await Share.share(
            {
                message:
                    Platform.OS === "ios"
                        ? `Hello! Let's go Splitsies on ${_expenseManager.currentExpense?.name}, click the link the join.\n`
                        : `splitsies://expenses/${_expenseManager.currentExpense?.id}/${_userManager.userId}`,
                url: `splitsies://expenses/${_expenseManager.currentExpense?.id}/${_userManager.userId}`,
                title: "`Hello! Let's go Splitsies on ${_expenseManager.currentExpense?.name}, click the link the join.`",
            },
            {
                dialogTitle: "Share to...",
            },
        );
    };

    return (
        <Tab.Navigator
            initialRouteName="Items"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: _colorConfiguration.primary,
                tabBarLabelStyle: { ..._styleManager.typography.subtext },
                tabBarStyle: { paddingTop: 3 },
            }}
        >
            <Tab.Screen
                name="Items"
                component={ExpenseGroupScreen}
                options={{
                    lazy: true,
                    tabBarIcon: ({ color, size }) => <Receipt width={size} height={size} fill={color} />,
                }}
            />
            <Tab.Screen
                name="People"
                component={PeopleGroupScreen}
                options={{
                    lazy: true,
                    tabBarButton: (props) => (
                        <View style={props.style}>
                            <TutorialTip group="expense" stepKey="people">
                                <Pressable {...props} />
                            </TutorialTip>
                        </View>
                    ),
                    tabBarIcon: ({ color, size }) => <People width={size} height={size} fill={color} />,
                }}
            />
            <Tab.Screen
                component={C}
                name="Camera"
                options={({ navigation }) => ({
                    tabBarButton: (props) => (
                        <TutorialTip group="home" stepKey="scanButton" childContentSpacing={35} renderOnLayout>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.tab}
                                onPress={() => navigation.navigate("CameraScreen", { expenseId: currentExpense!.id })}
                            >
                                <Animated.View style={[styles.cameraButton, style]}>
                                    {/* <AnimatedCamera
                                        animatedProps={iconSize}
                                        fill={_colorConfiguration.black}
                                    /> */}
                                    <AnimatedSvg
                                        height="48" viewBox="0 -960 960 960" width="48"
                                        animatedProps={iconSize}
                                        fill={_colorConfiguration.black}>
                                        <Path d="M479.706-262q74.853 0 125.073-49.875Q655-361.75 655-436.029q0-74.53-50.397-125.25Q554.206-612 479.853-612q-75.353 0-125.103 50.637Q305-510.725 305-436.029q0 74.529 49.843 124.279T479.706-262Zm.04-77Q438-339 410-366.908q-28-27.909-28-69.5Q382-479 410.049-507.5q28.05-28.5 70-28.5Q521-536 550-507.887q29 28.112 29 71Q579-395 550.346-367q-28.653 28-70.6 28ZM150-99q-37.175 0-64.088-26.912Q59-152.825 59-190v-493q0-37.225 26.912-64.613Q112.825-775 150-775h126l55-61q13-13 29.677-19.5T396-862h170q16.292 0 33.146 6.5T629-836l57 61h124q37.225 0 64.613 27.387Q902-720.225 902-683v493q0 37.175-27.387 64.088Q847.225-99 810-99H150Z" />

                                    </AnimatedSvg>
                                </Animated.View>
                            </TouchableOpacity>
                        </TutorialTip>
                    ),
                })}
            />
            <Tab.Screen
                name="Invite"
                component={InviteNavigator}
                options={{
                    lazy: true,
                    tabBarButton: (props) => (
                        <View style={props.style}>
                            <TutorialTip group="expense" stepKey="invite">
                                <Pressable {...props} />
                            </TutorialTip>
                        </View>
                    ),
                    tabBarIcon: ({ color, size }) => <AddPerson width={size} height={size} fill={color} />,
                }}
            />
            <Tab.Screen
                name="Share"
                component={ExpenseNavigationHeader}
                options={{
                    tabBarButton: (props) => (
                        <View style={props.style}>
                            <TutorialTip group="expense" stepKey="share">
                                <Pressable {...props} onPress={onShare} />
                            </TutorialTip>
                        </View>
                    ),
                    tabBarIcon: ({ color, size }) => <ShareIcon width={size} height={size} fill={color} />,
                }}
            />
        </Tab.Navigator>
    );
});

const styles = StyleSheet.create({
    tab: {
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    cameraButton: {
        position: "relative",
        backgroundColor: _colorConfiguration.primary,
        shadowColor: _colorConfiguration.darkOverlay,
        elevation: 5,
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        borderRadius: 50,
        width: 75,
        height: 75,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    badge: {
        marginLeft: 5,
        marginTop: -2,
        backgroundColor: _colorConfiguration.primary,
        color: _colorConfiguration.black,
        ..._styleManager.typography.body,
        fontSize: 10,
        height: 20,
        minWidth: 20,
        lineHeight: 20 * (1 / PixelRatio.getFontScale()),
    },
});
