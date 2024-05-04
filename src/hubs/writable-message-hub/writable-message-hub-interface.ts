import { Observable } from "rxjs";
import { IMessageHub } from "../message-hub/message-hub-interface";
import { IPushMessage } from "../../models/push-message/push-message-interface";

export interface IWritableMessageHub extends IMessageHub {
    publishPushMessage(message: IPushMessage): void;
    publishForegroundNotificationReceived(message: IPushMessage): void;
}

export const IWritableMessageHub = Symbol.for("IWritableMessageHub");
