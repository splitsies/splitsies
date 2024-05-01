import { Alert, Linking, PermissionStatus, PermissionsAndroid, Platform } from "react-native";
import { IPersmissionRequester } from "./permission-requester-interface";
import { injectable } from "inversify";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import messaging from "@react-native-firebase/messaging";

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
        const permission = Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
        let result = await check(permission);

        if (result === RESULTS.DENIED) {
            // The permission has not been requested, so request it.
            result = await request(permission);
            return result === RESULTS.GRANTED ? "granted" : "denied";
        } else if (result !== RESULTS.GRANTED && result !== RESULTS.UNAVAILABLE) {
            Alert.alert(`Camera Access Required`, "Open settings to enable camera access?", [
                { text: "Yes", onPress: async () => await Linking.openSettings() },
                { text: "No", style: "cancel" },
            ]);
        }

        return result === RESULTS.GRANTED ? "granted" : "denied";
    }

    async requestAppTrackingTransparency(): Promise<void> {
        // Currently only required on ios
        if (Platform.OS !== "ios") return;

        const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);

        if (result === RESULTS.DENIED) {
            // The permission has not been requested, so request it.
            await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY

            );
        }
    }

    async requestPushNotificationPermission(): Promise<PermissionStatus> {
        if (Platform.OS === "ios") {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log("Authorization status:", authStatus);
            }

            return enabled ? "granted" : "denied";
        } else if (Number(Platform.Version) >= 33) {
            const authStatus = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            console.log({ authStatus });
            return authStatus;
        }

        // Android platform < 33 don't have the permission, always allow it
        return "granted";
    }
}
