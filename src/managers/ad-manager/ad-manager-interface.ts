import { InterstitialAd } from "react-native-google-mobile-ads";

export interface IAdManager {
    initialize(): Promise<void>;
    generateInterstitialAd(): Promise<InterstitialAd | null>;
}

export const IAdManager = Symbol.for("IAdManager");
