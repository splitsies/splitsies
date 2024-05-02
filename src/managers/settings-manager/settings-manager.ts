import { injectable } from "inversify";
import { ISettingsManager } from "./settings-manager-interface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SettingsConfiguration from "../../config/settings.config.json";
import { BehaviorSubject, Observable } from "rxjs";
import { BaseManager } from "../base-manager";

@injectable()
export class SettingsManager extends BaseManager implements ISettingsManager {
    private readonly _joinRequestNotificationsAllowed$ = new BehaviorSubject<boolean>(false);

    protected async initialize(): Promise<void> {
        const setting = await AsyncStorage.getItem(
            SettingsConfiguration.pushNotifications.joinRequestNotifications.key,
        );
        this._joinRequestNotificationsAllowed$.next(
            setting === null
                ? SettingsConfiguration.pushNotifications.joinRequestNotifications.default
                : setting === "true",
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
}
