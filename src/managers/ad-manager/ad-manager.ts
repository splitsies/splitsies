import { injectable } from "inversify";
import { IAdManager } from "./ad-manager-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { IPersmissionRequester } from "../../utils/permission-requester/permission-requester-interface";
import mobileAds from "react-native-google-mobile-ads";
import { IAdConfiguration } from "../../models/configuration/ad-configuration/ad-configuration-interface";
import { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import { IWritableMessageHub } from "../../hubs/writable-message-hub/writable-message-hub-interface";

@injectable()
export class AdManager implements IAdManager {
    private readonly _permissionRequester = lazyInject<IPersmissionRequester>(IPersmissionRequester);
    private readonly _adConfiguration = lazyInject<IAdConfiguration>(IAdConfiguration);
    private readonly _messageHub = lazyInject<IWritableMessageHub>(IWritableMessageHub);

    async initialize(): Promise<void> {
        await this._permissionRequester.requestAppTrackingTransparency();
        await mobileAds().setRequestConfiguration({
            // An array of test device IDs to allow.
            testDeviceIdentifiers: ["EMULATOR"],
        });

        const adapterStatuses = await mobileAds().initialize();
    }

    /**
     * Generates an interstitial ad. Returns a callback for the component to decide when to show
     * @returns A callback to display the ad
     */
    async generateInterstitialAd(): Promise<InterstitialAd | null> {
        try {
            const interstitial = InterstitialAd.createForAdRequest(this._adConfiguration.interstitialId);
            const loadedPromise = new Promise<void>((resolve, reject) => {
                interstitial.addAdEventListener(AdEventType.LOADED, () => {
                    resolve();
                });

                interstitial.addAdEventListener(AdEventType.ERROR, () => {
                    reject();
                    this._messageHub.publishAdVisible(false);
                });

                interstitial.addAdEventListener(AdEventType.OPENED, () => {
                    this._messageHub.publishAdVisible(true);
                });

                interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                    this._messageHub.publishAdVisible(false);
                });

                interstitial.load();
            });

            await loadedPromise;
            return interstitial;
        } catch (e) {
            console.error(`Error generating ad: ${e}`);
            return null;
        }
    }
}
