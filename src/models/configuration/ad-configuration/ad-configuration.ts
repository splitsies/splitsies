import { injectable } from "inversify";
import { Platform } from "react-native";
import { IAdConfiguration } from "./ad-configuration-interface";
import AdmobConfig from "../../../config/admob.config.json";

@injectable()
export class AdConfiguration implements IAdConfiguration {
    readonly appId: string;
    readonly interstitialId: string;

    constructor() {
        this.interstitialId =
            Platform.OS === "ios" ? AdmobConfig.ios.interstitialId : AdmobConfig.android.interstitialId;
        this.appId = Platform.OS === "ios" ? AdmobConfig.ios.appId : AdmobConfig.android.appId;
    }
}
