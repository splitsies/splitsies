import { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { NotificationType } from "../../types/notification-type";
import { IPushMessage } from "./push-message-interface";

export class PushMessage implements IPushMessage {
    constructor(
        readonly type: NotificationType,
        readonly data?: { [key: string]: string | object } | undefined,
        readonly notification?: FirebaseMessagingTypes.Notification | undefined,
    ) {}
}
