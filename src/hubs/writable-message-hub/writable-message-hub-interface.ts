import { IMessageHub } from "../message-hub/message-hub-interface";
import { IPushMessage } from "../../models/push-message/push-message-interface";

export interface IWritableMessageHub extends IMessageHub {
    publishNotificationOpened(message: IPushMessage): void;
    publishForegroundNotificationReceived(message: IPushMessage): void;
    publishAdVisible(isVisible: boolean): void;
}

export const IWritableMessageHub = Symbol.for("IWritableMessageHub");
