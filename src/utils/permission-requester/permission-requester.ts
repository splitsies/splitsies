import { PermissionStatus, PermissionsAndroid, Platform } from "react-native";
import { IPersmissionRequester } from "./permission-requester-interface";
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
}
