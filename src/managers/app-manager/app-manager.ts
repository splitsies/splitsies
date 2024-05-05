import { injectable } from "inversify";
import { IAppManager } from "./app-manager-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { IMessageHub } from "../../hubs/message-hub/message-hub-interface";
import { StatusBar } from "react-native";
import { IThemeViewModel } from "../../view-models/theme-view-model/theme-view-model-interface";

@injectable()
export class AppManager implements IAppManager {
    private readonly _messageHub = lazyInject<IMessageHub>(IMessageHub);
    private readonly _themeManager = lazyInject<IThemeViewModel>(IThemeViewModel);
    private _resolver = () => {};

    readonly initialized: Promise<void> = new Promise((resolve) => {
        this._resolver = resolve;
    });

    initialize(): void {
        StatusBar.setHidden(false);

        this._messageHub.adVisible$.subscribe({
            next: (isVisible) => {
                StatusBar.setHidden(isVisible);
                StatusBar.setBarStyle(this._themeManager.theme === "light" ? "dark-content" : "light-content");
            },
        });

        this._resolver();
    }
}
