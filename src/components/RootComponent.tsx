import React from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { IUserCredential } from "@splitsies/shared-models";
import { useState, useEffect } from "react";
import { Subscription } from "rxjs";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { RootStackScreenParams } from "../screens/root-stack-screen-params";
import { lazyInject } from "../utils/lazy-inject";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { ExpenseScreen } from "../screens/ExpenseScreen";
import { ImageScreen } from "../screens/ImageScreen";
import { CameraScreen } from "../screens/CameraScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { useInitialize } from "../hooks/use-initialize";
import SplashScreen from "react-native-splash-screen";
import { RootDrawerContent } from "./RootDrawerContent";
import { ProfileScreen } from "../screens/ProfileScreen";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _styleManager = lazyInject<IStyleManager>(IStyleManager);
_styleManager.initialize();

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _userManager = lazyInject<IUserManager>(IUserManager);

const Stack = createNativeStackNavigator<RootStackScreenParams>();
const Drawer = createDrawerNavigator();

export const RootComponent = () => {
    const [initialRoute, setInitialRoute] = useState<"RootScreen" | "LoginScreen">("LoginScreen");
    const [userId, setUserId] = useState<string>("");
    const navigation = useNavigation<NavigationProp<RootStackScreenParams>>();

    useInitialize(() => {
        const subscription = new Subscription();

        _userManager.initialized.then(() => {
            setInitialRoute(_userManager.user ? "RootScreen" : "LoginScreen");
            subscription.add(
                _userManager.user$.subscribe({
                    next: (credential) => onUserUpdated(credential),
                }),
            );
            SplashScreen.hide();
        });

        return () => subscription?.unsubscribe();
    });

    const onUserUpdated = (cred: IUserCredential | null) => {
        if (cred && cred.user.id === userId) return;

        setUserId(cred?.user.id ?? "");
        navigation.navigate(cred ? "RootScreen" : "LoginScreen");
    };

    const Root = () => {
        return (
            <Drawer.Navigator
                initialRouteName={initialRoute}
                drawerContent={RootDrawerContent}
                screenOptions={{
                    headerShown: false,
                    drawerPosition: "right",
                    drawerActiveTintColor: _colorConfiguration.black,
                    drawerActiveBackgroundColor: _colorConfiguration.primaryTranslucentLight,
                    drawerLabelStyle: _styleManager.typography.body,
                }}
            >
                <Drawer.Screen name="Home" component={HomeScreen} />
                <Drawer.Screen name="Profile" component={ProfileScreen} />
            </Drawer.Navigator>
        );
    };

    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="RootScreen" component={Root} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="ExpenseScreen" component={ExpenseScreen} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
            <Stack.Screen name="ImageScreen" component={ImageScreen} />
        </Stack.Navigator>
    );
};
