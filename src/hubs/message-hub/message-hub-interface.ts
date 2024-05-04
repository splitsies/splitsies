import { Observable } from "rxjs";
import { IPushMessage } from "../../models/push-message/push-message-interface";

export interface IMessageHub {
    notificationOpened$: Observable<IPushMessage>;
    foregroundNotificationReceived$: Observable<IPushMessage>;
}

export const IMessageHub = Symbol.for("IMessageHub");
