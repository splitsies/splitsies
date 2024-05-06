import { injectable } from "inversify";
import { IMessageHub } from "./message-hub-interface";
import { Observable, Subject } from "rxjs";
import { IPushMessage } from "../../models/push-message/push-message-interface";

@injectable()
export class MessageHub implements IMessageHub {
    protected readonly _notificationOpened$ = new Subject<IPushMessage>();
    protected readonly _foregroundNotificationReceived = new Subject<IPushMessage>();
    protected readonly _adVisible$ = new Subject<boolean>();

    get notificationOpened$(): Observable<IPushMessage> {
        return this._notificationOpened$.asObservable();
    }

    get foregroundNotificationReceived$(): Observable<IPushMessage> {
        return this._foregroundNotificationReceived.asObservable();
    }

    get adVisible$(): Observable<boolean> {
        return this._adVisible$.asObservable();
    }
}
