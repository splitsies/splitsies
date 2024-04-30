import { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { NotificationType } from "../../types/notification-type";

export interface IPushMessage {
    type: NotificationType;
    data?: {[key: string]: string | object; } | undefined,
    notification?: FirebaseMessagingTypes.Notification
}