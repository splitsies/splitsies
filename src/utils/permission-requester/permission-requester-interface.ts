import { PermissionStatus } from "react-native";

export interface IPersmissionRequester {
    requestReadContacts(): Promise<PermissionStatus>;
}

export const IPersmissionRequester = Symbol.for("IPermissionRequester");
