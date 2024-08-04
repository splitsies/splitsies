import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Button, Colors, Text, TouchableOpacity, View } from "react-native-ui-lib";
import { RequestsFeedScreen } from "../screens/RequestsFeedScreen";
import { ExpenseFeedScreen } from "../screens/ExpenseFeedScreen";
import { PixelRatio, Pressable, StyleSheet } from "react-native";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import Camera from "../../assets/icons/camera.svg";
import Receipt from "../../assets/icons/receipt.svg";
import People from "../../assets/icons/people.svg";
import { useInitialize } from "../hooks/use-initialize";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { TutorialTip } from "../components/TutorialTip";

const Tab = createBottomTabNavigator();
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

// TODO: Hack, satisfy the unused component param
const C = () => {
    return null;
};

export const FeedNavigator = () => {
    useInitialize(() => {
        void _expenseManager.requestExpenseJoinRequests();
    });

    const requestsBadge = useObservableReducer<number, string | undefined>(
        _expenseManager.expenseJoinRequestCount$,
        undefined,
        (count) => {
            if (count === 0) return undefined;
            if (count > 99) return "99+";
            return `${count}`;
        },
    );

    return (
        <Tab.Navigator
            initialRouteName="Feed"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: _colorConfiguration.primary,
                tabBarLabelStyle: { ..._styleManager.typography.subtext },
                tabBarStyle: { paddingTop: 3 },
            }}
        >
            <Tab.Screen
                name="Feed"
                component={ExpenseFeedScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Receipt width={size} height={size} fill={color} />,
                }}
            />
            <Tab.Screen
                component={C}
                name="Camera"
                options={({ navigation }) => ({
                    tabBarButton: (props) => (
                        <TutorialTip group="home" stepKey="scanButton" childContentSpacing={35} useNextIcon>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.tab}
                                onPress={() => navigation.navigate("CameraScreen")}
                            >
                                <View style={styles.cameraButton}>
                                    <Camera
                                        width={_uiConfig.sizes.largeIcon}
                                        height={_uiConfig.sizes.largeIcon}
                                        fill={_colorConfiguration.black}
                                    />
                                </View>
                            </TouchableOpacity>
                        </TutorialTip>
                    ),
                })}
            />
            <Tab.Screen
                name="Requests"
                component={RequestsFeedScreen}
                options={{
                    tabBarButton: (props) => <View style={props.style}><TutorialTip group="home" stepKey="requests"><Pressable {...props} /></TutorialTip></View>,
                    tabBarIcon: ({ color, size }) => <People width={size} height={size} fill={color} />,
                    tabBarBadge: requestsBadge,
                    tabBarBadgeStyle: styles.badge,
                }}
            />
        </Tab.Navigator>
    );
};

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
        bottom: 22,
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
