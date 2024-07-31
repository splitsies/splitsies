import { injectable } from "inversify";
import { ISettingsManager } from "./settings-manager-interface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SettingsConfiguration from "../../config/settings.config.json";
import { BehaviorSubject, Observable } from "rxjs";
import { BaseManager } from "../base-manager";

@injectable()
export class SettingsManager extends BaseManager implements ISettingsManager {
    private readonly _markPaidOnPay$ = new BehaviorSubject<boolean>(false);
    private readonly _markPaidOnRequest$ = new BehaviorSubject<boolean>(false);
    private readonly _joinRequestNotificationsAllowed$ = new BehaviorSubject<boolean>(false);

    protected async initialize(): Promise<void> {
        const push = await AsyncStorage.getItem(SettingsConfiguration.pushNotifications.joinRequestNotifications.key);

        this._joinRequestNotificationsAllowed$.next(
            push === null ? SettingsConfiguration.pushNotifications.joinRequestNotifications.default : push === "true",
        );

        const markAsPaid = await AsyncStorage.getItem(SettingsConfiguration.behavior.markPaidOnPay.key);
        this._markPaidOnPay$.next(
            markAsPaid === null ? SettingsConfiguration.behavior.markPaidOnPay.default : markAsPaid === "true",
        );

        const markAsPaidOnRequest = await AsyncStorage.getItem(SettingsConfiguration.behavior.markPaidOnRequest.key);
        this._markPaidOnRequest$.next(
            markAsPaidOnRequest === null
                ? SettingsConfiguration.behavior.markPaidOnRequest.default
                : markAsPaidOnRequest === "true",
        );
    }

    get joinRequestNotificationsAllowed$(): Observable<boolean> {
        return this._joinRequestNotificationsAllowed$.asObservable();
    }

    get joinRequestNotificationsAllowed(): boolean {
        return this._joinRequestNotificationsAllowed$.value;
    }

    async setJoinRequestNotificationsAllowed(allowed: boolean): Promise<void> {
        try {
            await AsyncStorage.setItem(
                SettingsConfiguration.pushNotifications.joinRequestNotifications.key,
                `${allowed}`.toLowerCase(),
            );
            this._joinRequestNotificationsAllowed$.next(allowed);
        } catch (e) {
            console.error(e);
        }
    }

    get markPaidOnPay$(): Observable<boolean> {
        return this._markPaidOnPay$.asObservable();
    }
    get markPaidOnPay(): boolean {
        return this._markPaidOnPay$.value;
    }

    async setMarkPaidOnPay(enabled: boolean): Promise<void> {
        try {
            await AsyncStorage.setItem(SettingsConfiguration.behavior.markPaidOnPay.key, `${enabled}`.toLowerCase());
            this._markPaidOnPay$.next(enabled);
        } catch (e) {
            console.error(e);
        }
    }

    get markPaidOnRequest$(): Observable<boolean> {
        return this._markPaidOnRequest$.asObservable();
    }
    get markPaidOnRequest(): boolean {
        return this._markPaidOnRequest$.value;
    }

    async setMarkPaidOnRequest(enabled: boolean): Promise<void> {
        try {
            await AsyncStorage.setItem(
                SettingsConfiguration.behavior.markPaidOnRequest.key,
                `${enabled}`.toLowerCase(),
            );
            this._markPaidOnRequest$.next(enabled);
        } catch (e) {
            console.error(e);
        }
    }
}
