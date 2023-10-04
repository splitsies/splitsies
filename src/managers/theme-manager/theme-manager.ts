import { injectable } from "inversify";
import { IThemeManager } from "./theme-manager-interface";
import { IColorConfiguration } from "../../models/configuration/color-config/color-configuration-interface";
import { Colors, Typography } from "react-native-ui-lib";
import { lazyInject } from "../../utils/lazy-inject";

@injectable()
export class ThemeManager implements IThemeManager {
    private readonly colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

    initialize(): void {
        Colors.loadColors({
            primary: this.colorConfiguration.primary,
        });

        Typography.loadTypographies({
            heading: { fontSize: 36, fontWeight: "600", fontFamily: "Avenir-Heavy" },
            body: { fontSize: 18, fontFamily: "Avenir-Roman" },
        });

        console.log("initialized the theme!!");
    }
}
