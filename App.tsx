import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { RootComponent } from "./src/components/RootComponent";
import { Colors } from "react-native-ui-lib";
import { useColorScheme } from "react-native";
import { lazyInject } from "./src/utils/lazy-inject";
import { IThemeViewModel } from "./src/view-models/theme-view-model/theme-view-model-interface";

const uiLibConfig = require("react-native-ui-lib/config");
uiLibConfig.setConfig({ appScheme: "default" });

const _themeViewModel = lazyInject<IThemeViewModel>(IThemeViewModel);

function App(): JSX.Element {
    const colorScheme = useColorScheme();

    useEffect(() => {
        const scheme = colorScheme === "dark" ? "dark" : "light";

        Colors.setScheme(scheme);
        _themeViewModel.setTheme(scheme);
    }, [colorScheme]);

    return <RootComponent />;
}

export default App;
