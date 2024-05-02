import React from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { IUserCredential } from "@splitsies/shared-models";
import { useState } from "react";
import { Subscription } from "rxjs";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { RootStackParamList } from "../types/params";
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
import { UpdateRequiredScreen } from "../screens/UpdateRequiredScreen";
import { version } from "../../package.json";
import { Version } from "../models/version/version";
import { IVersionManager } from "../managers/version-manager/version-manager-interface";

const _versionManager = lazyInject<IVersionManager>(IVersionManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _appVersion = new Version(version);

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    const [userId, setUserId] = useState<string>("");
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useInitialize(() => {
        const subscription = new Subscription();

        _versionManager.initialized.then(() => {
            if (_versionManager.requiresUpdate) {
                navigation.navigate("UpdateRequiredScreen");
                SplashScreen.hide();
                return;
            }

            _userManager.initialized.then(() => {
                subscription.add(
                    _userManager.user$.subscribe({
                        next: (credential) => onUserUpdated(credential),
                    }),
                );
                SplashScreen.hide();
            });
        });

        return () => subscription.unsubscribe();
    });

    const onUserUpdated = (cred: IUserCredential | null) => {
        if (cred && cred.user.id === userId) return;
        setUserId(cred?.user.id ?? "");
        const screen = cred ? "RootScreen" : "LoginScreen";
        navigation.navigate(screen);
    };

    return (
        <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RootScreen" component={HomeNavigator} options={{ gestureEnabled: false }} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="ExpenseScreen" component={ExpenseNavigator} options={{ gestureEnabled: false }} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
            <Stack.Screen name="ImageScreen" component={ImageScreen} />
            <Stack.Screen name="UpdateRequiredScreen" component={UpdateRequiredScreen} />
        </Stack.Navigator>
    );
};
