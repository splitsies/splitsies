import { Linking, PermissionStatus, PermissionsAndroid, Platform } from "react-native";
import { IPersmissionRequester } from "./permission-requester-interface";
import { Camera } from "react-native-vision-camera";
import { injectable } from "inversify";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

@injectable()
export class PermissionRequester implements IPersmissionRequester {
    requestReadContacts(): Promise<PermissionStatus> {
        if (Platform.OS === "android") {
            return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
                title: "Contacts",
                message: "This app would like to view your contacts.",
                buttonPositive: "Please",
            });
        }

        return Promise.resolve("never_ask_again");
    }

    async requestCameraPersmission(): Promise<PermissionStatus> {
        const permission = await Camera.requestCameraPermission();
        if (permission === "denied") Linking.openSettings();

        return permission;
    }

    async requestAppTrackingTransparency(): Promise<void> {
        // Currently only required on ios
        if (Platform.OS !== "ios") return;

        const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);

        if (result === RESULTS.DENIED) {
            // The permission has not been requested, so request it.
            await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
        }
    }
}
