import { injectable } from "inversify";
import { IThemeViewModel } from "./theme-view-model-interface";
import { BehaviorSubject, Observable } from "rxjs";
import { Platform, StatusBar } from "react-native";
import { Colors } from "react-native-ui-lib/core";
import { lazyInject } from "../../utils/lazy-inject";
import { IColorConfiguration } from "../../models/configuration/color-config/color-configuration-interface";

@injectable()
export class ThemeViewModel implements IThemeViewModel {
    private readonly _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
    private readonly _theme = new BehaviorSubject<"dark" | "light">("light");

    get theme$(): Observable<"dark" | "light"> {
        return this._theme.asObservable();
    }

    get theme(): "dark" | "light" {
        return this._theme.value;
    }

    setTheme(value: "dark" | "light"): void {
        if (this.theme === value) return;
        this._theme.next(value);
        StatusBar.setBarStyle(value === "light" ? "dark-content" : "light-content");
        if (Platform.OS === "android") StatusBar.setBackgroundColor(value === "light" ? Colors.white : Colors.grey1);
    }
}
