import { Observable } from "rxjs";
import { IPushMessage } from "../../models/push-message/push-message-interface";

export interface IMessageHub {
    notificationOpened$: Observable<IPushMessage>;
    foregroundNotificationReceived$: Observable<IPushMessage>;
    adVisible$: Observable<boolean>;
}

export const IMessageHub = Symbol.for("IMessageHub");
