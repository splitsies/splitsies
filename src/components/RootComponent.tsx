import React from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { IUserCredential } from "@splitsies/shared-models";
import { useState } from "react";
import { Subscription } from "rxjs";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { RootStackScreenParams } from "../screens/root-stack-screen-params";
import { lazyInject } from "../utils/lazy-inject";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { ImageScreen } from "../screens/ImageScreen";
import { CameraScreen } from "../screens/CameraScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { useInitialize } from "../hooks/use-initialize";
import { ExpenseNavigator } from "../navigators/ExpenseNavigator";
import { HomeNavigator } from "../navigators/HomeNavigator";
import SplashScreen from "react-native-splash-screen";

const _styleManager = lazyInject<IStyleManager>(IStyleManager);
_styleManager.initialize();

const _userManager = lazyInject<IUserManager>(IUserManager);

const Stack = createNativeStackNavigator<RootStackScreenParams>();

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

    return (
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="RootScreen" component={HomeNavigator} options={{ gestureEnabled: false }} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="ExpenseScreen" component={ExpenseNavigator} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
            <Stack.Screen name="ImageScreen" component={ImageScreen} />
        </Stack.Navigator>
    );
};
