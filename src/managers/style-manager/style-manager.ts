import { injectable } from "inversify";
import { IStyleManager } from "./style-manager-interface";
import { IColorConfiguration } from "../../models/configuration/color-config/color-configuration-interface";
import { Assets, Colors, Typography } from "react-native-ui-lib";
import { lazyInject } from "../../utils/lazy-inject";
import { ThemeManager } from "react-native-ui-lib";

@injectable()
export class StyleManager implements IStyleManager {
    private readonly colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

    initialize(): void {
        Colors.loadColors({
            primary: this.colorConfiguration.primary,
            primaryTranslucent: this.colorConfiguration.primaryTranslucent,
            hint: this.colorConfiguration.greyFont,
        });

        Typography.loadTypographies({
            heading: { fontSize: 36, fontWeight: "600", fontFamily: "Avenir-Heavy" },
            subheading: { fontSize: 24, fontWeight: "400", fontFamily: "Avenir-Heavy" },
            body: { fontSize: 15, fontFamily: "Avenir-Roman" },
            subtext: { fontSize: 13, fontFamily: "Avenir-Roman" },
            letter: { fontFamily: "ZillaSlab-Bold" },
            letterHeading: { fontFamily: "ZillaSlab-Bold", fontSize: 36 },
            hint: { fontSize: 14, fontFamily: "Avenir-Medium", color: this.colorConfiguration.greyFont },
        });

        ThemeManager.setComponentTheme("Text", {
            body: true,
        });

        Assets.loadAssetsGroup("icons", {
            logoWhite: require("../../../assets/icons/logo_white.png"),
            logoBlack: require("../../../assets/icons/logo_black.png"),
            logoGrey: require("../../../assets/icons/logo-grey.png"),
            logoPrimary: require("../../../assets/icons/logo-primary.png"),
            location: require("../../../assets/icons/location.png"),
            calendar: require("../../../assets/icons/calendar.png"),
            price: require("../../../assets/icons/price.png"),
            people: require("../../../assets/icons/people.png"),
            error: require("../../../assets/icons/error.png"),
            arrowBack: require("../../../assets/icons/arrow-back.png"),
            pencil: require("../../../assets/icons/pencil.png"),
            addUser: require("../../../assets/icons/add-person.png"),
            camera: require("../../../assets/icons/camera.png"),
            photoLibrary: require("../../../assets/icons/photo-library.png"),
            checkCircle: require("../../../assets/icons/check-circle.png"),
            edit: require("../../../assets/icons/edit.png"),
            capture: require("../../../assets/icons/capture.png"),
        });
    }
}
