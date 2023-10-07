import { injectable } from "inversify";
import { IColorConfiguration } from "./color-configuration-interface";
import config from "../../../config/colors.config.json";

@injectable()
export class ColorConfiguration implements IColorConfiguration {
    readonly primary: string;
    readonly primaryTranslucent: string;
    readonly primaryTranslucentLight: string;
    readonly primaryTranslucentDark: string;
    readonly white: string;
    readonly black: string;
    readonly greyFont: string;
    readonly greyFontLight: string;
    readonly greyFontDark: string;
    readonly darkOverlay: string;
    readonly divider: string;
    readonly dividerLight: string;
    readonly dividerDark: string;
    readonly iosKeyboardBgDarkDark: string;
    readonly iosKeyboardBgDarkLight: string;
    readonly iosKeyboardBgLightDark: string;
    readonly iosKeyboardBgLightLight: string;
    readonly iosKeyboardBtnDarkDark: string;
    readonly iosKeyboardBtnDarkLight: string;
    readonly iosKeyboardBtnLightDark: string;
    readonly iosKeyboardBtnLightLight: string;

    constructor() {
        this.primary = config.primary;
        this.primaryTranslucent = config.primaryTranslucent;
        this.primaryTranslucentLight = config.primaryTranslucentLight;
        this.primaryTranslucentDark = config.primaryTranslucentDark;
        this.white = config.white;
        this.black = config.black;
        this.greyFont = config.greyFont;
        this.greyFontLight = config.greyFontLight;
        this.greyFontDark = config.greyFontDark;
        this.darkOverlay = config.darkOverlay;
        this.divider = config.divider;
        this.dividerLight = config.dividerLight;
        this.dividerDark = config.dividerDark;
        this.iosKeyboardBgDarkDark = config.iosKeyboardBgDarkDark;
        this.iosKeyboardBgDarkLight = config.iosKeyboardBgDarkLight;
        this.iosKeyboardBgLightDark = config.iosKeyboardBgLightDark;
        this.iosKeyboardBgLightLight = config.iosKeyboardBgLightLight;
        this.iosKeyboardBtnDarkDark = config.iosKeyboardBtnDarkDark;
        this.iosKeyboardBtnDarkLight = config.iosKeyboardBtnDarkLight;
        this.iosKeyboardBtnLightDark = config.iosKeyboardBtnLightDark;
        this.iosKeyboardBtnLightLight = config.iosKeyboardBtnLightLight;
    }
}
