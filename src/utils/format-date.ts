import { NativeModules, Platform } from "react-native";

const Locale = (
    Platform.OS === "ios"
        ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier
).replace(/_/, "-");

// this type is the same as DATE_OPTIONS to satisfy the typescript compiler
type DateTimeFormatOptions = { weekday: "long"; year: "numeric"; month: "long"; day: "numeric" };
const DATE_OPTIONS: DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

export const format = (date: Date): string =>
    date.toLocaleString(Locale, DATE_OPTIONS).replace(/\d{2}:\d{2}:\d{2}/, "");
