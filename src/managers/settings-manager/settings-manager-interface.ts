import { Observable } from "rxjs";
import { IBaseManager } from "../base-manager-interface";

export interface ISettingsManager extends IBaseManager {
    readonly joinRequestNotificationsAllowed$: Observable<boolean>;
    readonly joinRequestNotificationsAllowed: boolean
    setJoinRequestNotificationsAllowed(allowed: boolean): Promise<void>;
}

export const ISettingsManager = Symbol.for("ISettingsManager");