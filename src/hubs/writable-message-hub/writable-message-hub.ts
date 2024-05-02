import { injectable } from "inversify";
import { IWritableMessageHub } from "./writable-message-hub-interface";
import { MessageHub } from "../message-hub/message-hub";
import { IPushMessage } from "../../models/push-message/push-message-interface";

@injectable()
export class WritableMessageHub extends MessageHub implements IWritableMessageHub {
    publishPushMessage(message: IPushMessage): void {
        this._notificationOpened$.next(message);
    }
}
