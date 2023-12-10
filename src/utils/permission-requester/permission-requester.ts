import { Linking, PermissionStatus, PermissionsAndroid, Platform } from "react-native";
import { IPersmissionRequester } from "./permission-requester-interface";
import { Camera } from "react-native-vision-camera";
import { injectable } from "inversify";

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
}
