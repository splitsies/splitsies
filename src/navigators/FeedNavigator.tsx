import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Icon, TouchableOpacity, View } from "react-native-ui-lib";
import { RequestsFeedScreen } from "../screens/RequestsFeedScreen";
import { ExpenseFeedScreen } from "../screens/ExpenseFeedScreen";
import { StyleSheet } from "react-native";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";

const Tab = createBottomTabNavigator();
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);

// TODO: Hack, satisfy the unused component param
const C = () => {
    return null;
};

export const FeedNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="Feed"
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.bar,
                tabBarActiveTintColor: _colorConfiguration.primary,
                tabBarLabelStyle: _styleManager.typography.subtext,
            }}
        >
            <Tab.Screen
                name="Feed"
                component={ExpenseFeedScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon assetName="receipt" tintColor={color} size={size} />,
                }}
            />
            <Tab.Screen
                component={C}
                name="Camera"
                options={({ navigation }) => ({
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.tab}
                            onPress={() => navigation.navigate("CameraScreen")}
                        >
                            <View style={styles.cameraButton}>
                                <Icon assetName="camera" size={30} />
                            </View>
                        </TouchableOpacity>
                    ),
                })}
            />
            <Tab.Screen
                name="Requests"
                component={RequestsFeedScreen}
                options={{ tabBarIcon: ({ color, size }) => <Icon assetName="people" tintColor={color} size={size} /> }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    bar: {
        height: 55,
    },
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
});
