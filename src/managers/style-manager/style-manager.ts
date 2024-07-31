import { injectable } from "inversify";
import { IStyleManager } from "./style-manager-interface";
import { IColorConfiguration } from "../../models/configuration/color-config/color-configuration-interface";
import { Assets, Colors, Typography } from "react-native-ui-lib";
import { lazyInject } from "../../utils/lazy-inject";
import { ThemeManager } from "react-native-ui-lib";

@injectable()
export class StyleManager implements IStyleManager {
    private readonly colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

    readonly typography = {
        heading: { fontSize: 27, fontFamily: "Avenir-Heavy" },
        subheading: { fontSize: 24, fontFamily: "Avenir-Heavy" },
        body: { fontSize: 15, fontFamily: "Avenir-Heavy" },
        bodyBold: { fontSize: 16, fontFamily: "Avenir-Heavy" },
        subtext: { fontSize: 13, fontFamily: "Avenir-Heavy" },
        letter: { fontFamily: "ZillaSlab-Bold" },
        letterHeading: { fontFamily: "ZillaSlab-Bold", fontSize: 36 },
        hint: { fontSize: 14, fontFamily: "Avenir-Medium", color: this.colorConfiguration.greyFont },
    };

    initialize(): void {
        Colors.loadColors({
            primary: this.colorConfiguration.primary,
            primaryTranslucentLight: this.colorConfiguration.primaryTranslucentLight,
            hint: this.colorConfiguration.greyFont,
            attention: this.colorConfiguration.attention,
            ready: this.colorConfiguration.ready,
        });

        Colors.loadSchemes({
            light: {
                screenBG: Colors.white,
                textColor: Colors.grey10,
                primaryTranslucent: this.colorConfiguration.primaryTranslucentLight,
                divider: this.colorConfiguration.divider,
            },
            dark: {
                screenBG: Colors.grey1,
                textColor: Colors.white,
                primaryTranslucent: this.colorConfiguration.primaryTranslucentDark,
                divider: this.colorConfiguration.dividerDark,
            },
        });

        Typography.loadTypographies(this.typography);

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
            add: require("../../../assets/icons/add.png"),
            more: require("../../../assets/icons/more.png"),
            close: require("../../../assets/icons/close.png"),
            qrAdd: require("../../../assets/icons/qr-add.png"),
            menu: require("../../../assets/icons/menu.png"),
            receipt: require("../../../assets/icons/receipt.png"),
        });
    }
}
