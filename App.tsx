import React, { useEffect } from "react";
import { RootComponent } from "./src/components/RootComponent";
import { Colors } from "react-native-ui-lib";
import { useColorScheme } from "react-native";
import { lazyInject } from "./src/utils/lazy-inject";
import { IThemeViewModel } from "./src/view-models/theme-view-model/theme-view-model-interface";
import { useInitialize } from "./src/hooks/use-initialize";
import { IAdManager } from "./src/managers/ad-manager/ad-manager-interface";

const uiLibConfig = require("react-native-ui-lib/config");
uiLibConfig.setConfig({ appScheme: "default" });

const _themeViewModel = lazyInject<IThemeViewModel>(IThemeViewModel);
const _adManager = lazyInject<IAdManager>(IAdManager);

function App(): JSX.Element {
    const colorScheme = useColorScheme();

    useInitialize(() => {
        void _adManager.initialize();
    });

    useEffect(() => {
        const scheme = colorScheme === "dark" ? "dark" : "light";

        Colors.setScheme(scheme);
        _themeViewModel.setTheme(scheme);
    }, [colorScheme]);

    return <RootComponent />;
}

export default App;
