import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme, Theme, LinkingOptions } from "@react-navigation/native";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { Colors, Text, View } from "react-native-ui-lib/core";
import { RootNavigator } from "../navigators/RootNavigator";
import { useColorScheme } from "react-native";
import { IThemeViewModel } from "../view-models/theme-view-model/theme-view-model-interface";
import { useObservable } from "../hooks/use-observable";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { linking } from "../config/linking.config";
import { BannerNotification } from "./BannerNotification";
import { NotificationContainer } from "./NotificationContainer";

const _themeViewModel = lazyInject<IThemeViewModel>(IThemeViewModel);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
_styleManager.initialize();

export const RootComponent = () => {
    const colorScheme = useObservable(_themeViewModel.theme$, useColorScheme());
    const [theme, setTheme] = useState<Theme>(DefaultTheme);

    useEffect(() => {
        Colors.scheme;
        setTheme({
            dark: colorScheme === "dark",
            colors: {
                ...DefaultTheme.colors,
                primary: Colors.primary,
                background: Colors.screenBG,
                text: Colors.textColor,
                border: Colors.divider,
                card: Colors.screenBG,
                notification: "rgb(255, 69, 58)",
            },
        });
    }, [colorScheme]);

    return (
        <NavigationContainer theme={theme} linking={linking as LinkingOptions<ReactNavigation.RootParamList>}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <NotificationContainer>
                    <RootNavigator />
                </NotificationContainer>
            </GestureHandlerRootView>
        </NavigationContainer>
    );
};
