import { PermissionStatus } from "react-native";

export interface IPersmissionRequester {
    requestReadContacts(): Promise<PermissionStatus>;
    requestCameraPersmission(): Promise<PermissionStatus>;
    requestAppTrackingTransparency(): Promise<void>;
    requestPushNotificationPermission(): Promise<PermissionStatus>;
}

export const IPersmissionRequester = Symbol.for("IPermissionRequester");
