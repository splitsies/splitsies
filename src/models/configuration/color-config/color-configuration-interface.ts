export interface IColorConfiguration {
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
    readonly attention: string;
    readonly ready: string;
}

export const IColorConfiguration = Symbol.for("IColorConfiguration");
