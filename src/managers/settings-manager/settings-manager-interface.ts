import { Observable } from "rxjs";
import { IBaseManager } from "../base-manager-interface";

export interface ISettingsManager extends IBaseManager {
    readonly joinRequestNotificationsAllowed$: Observable<boolean>;
    readonly joinRequestNotificationsAllowed: boolean;
    setJoinRequestNotificationsAllowed(allowed: boolean): Promise<void>;

    readonly markPaidOnPay$: Observable<boolean>;
    readonly markPaidOnPay: boolean;
    setMarkPaidOnPay(enabled: boolean): Promise<void>;

    readonly markPaidOnRequest$: Observable<boolean>;
    readonly markPaidOnRequest: boolean;
    setMarkPaidOnRequest(enabled: boolean): Promise<void>;
}

export const ISettingsManager = Symbol.for("ISettingsManager");
