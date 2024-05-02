import { injectable } from "inversify";
import { IMessageHub } from "./message-hub-interface";
import { Observable, Subject } from "rxjs";
import { IPushMessage } from "../../models/push-message/push-message-interface";

@injectable()
export class MessageHub implements IMessageHub {
    protected readonly _notificationOpened$ = new Subject<IPushMessage>();

    get notificationOpened$(): Observable<IPushMessage> {
        return this._notificationOpened$.asObservable();
    }
}
