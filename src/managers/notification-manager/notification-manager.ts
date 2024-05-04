import { injectable } from "inversify";
import { BaseManager } from "../base-manager";
import { lazyInject } from "../../utils/lazy-inject";
import { IPersmissionRequester } from "../../utils/permission-requester/permission-requester-interface";
import messaging, { FirebaseMessagingTypes, firebase } from "@react-native-firebase/messaging";
import { INotificationManager } from "./notification-manager-interface";
import { IUserManager } from "../user-manager/user-manager-interface";
import { getInternetCredentials, resetInternetCredentials, setInternetCredentials } from "react-native-keychain";
import { INotificationApiClient } from "../../api/notification-api-client/notification-api-client-interface";
import { UserCredential } from "@splitsies/shared-models";
import { ISettingsManager } from "../settings-manager/settings-manager-interface";
import { Platform } from "react-native";
import { filter } from "rxjs/operators";
import { Notifications } from "react-native-notifications";
import { IWritableMessageHub } from "../../hubs/writable-message-hub/writable-message-hub-interface";
import { PushMessage } from "../../models/push-message/push-message";
import { NotificationType } from "../../types/notification-type";
import { IAppManager } from "../app-manager/app-manager-interface";
import { IPushMessageHandlerProvider } from "../../providers/push-message-handler-provider/push-message-handler-provider-interface";

@injectable()
export class NotificationManager extends BaseManager implements INotificationManager {
    private static readonly SERVICE_NAME = "NotificationService";

    private readonly _appManager = lazyInject<IAppManager>(IAppManager);
    private readonly _settingsManager = lazyInject<ISettingsManager>(ISettingsManager);
    private readonly _permissionRequester = lazyInject<IPersmissionRequester>(IPersmissionRequester);
    private readonly _userManager = lazyInject<IUserManager>(IUserManager);
    private readonly _api = lazyInject<INotificationApiClient>(INotificationApiClient);
    private readonly _messageHub = lazyInject<IWritableMessageHub>(IWritableMessageHub);
    private readonly _pushMessageHandlerProvder = lazyInject<IPushMessageHandlerProvider>(IPushMessageHandlerProvider);

    constructor() {
        super();
    }

    protected async initialize(): Promise<void> {
        await this._api.initialized;
        const openedNotification = await Notifications.getInitialNotification();
        if (openedNotification) {
            this.onNotificationOpened({ ...openedNotification, data: openedNotification.payload } as any);
        }

        const status = await this._permissionRequester.requestPushNotificationPermission();
        if (status !== "granted") {
            return;
        }

        if (Platform.OS === "android" && Platform.Version >= 26) {
            Notifications.setNotificationChannel({
                channelId: "priority_notification",
                name: "Priority Notifications",
                importance: 4,
                enableVibration: true,
                enableLights: true,
                showBadge: true,
            });
        }

        const remoteTokenResolved = await this.initNativePushToken();
        if (!remoteTokenResolved) {
            return;
        }

        messaging().onTokenRefresh(this.onTokenRefresh.bind(this));
        messaging().setBackgroundMessageHandler(this.onBackgroundNotification.bind(this));
        messaging().onMessage(this.onForegroundNotification.bind(this));
        messaging().onNotificationOpenedApp(this.onNotificationOpened.bind(this));

        Notifications.events().registerNotificationOpened((notification) => {
            this.onNotificationOpened({ ...notification, data: notification.payload } as any);
        });

        await this._userManager.initialized;
        this._userManager.user$.pipe(filter((u) => !!u)).subscribe({ next: this.onUserUpdated.bind(this) });
        this._userManager.signoutRequested$.subscribe({ next: this.onSignoutRequested.bind(this) });
        this._settingsManager.joinRequestNotificationsAllowed$.subscribe({
            next: this.onPushNotificationSettingsChanged.bind(this),
        });
    }

    /**
     * For iOS, resolves when the APNS token is fetched.
     * Due to issues with the firebase-react-native package incorrectly determining
     * isDeviceRegisteredForRemoteMessages, we need to explicitly wait for the
     * APNS token to come back before intitializing the firebase token.
     * On Android, this immediately resolves successfully.
     */
    private async initNativePushToken(): Promise<boolean> {
        if (Platform.OS === "android") {
            // Firebase works well to ensure token init state on android
            return true;
        }

        return new Promise<boolean>(async (resolve) => {
            await messaging().registerDeviceForRemoteMessages();
            Notifications.registerRemoteNotifications();
            Notifications.events().registerRemoteNotificationsRegistered((_) => {
                resolve(true);
            });

            Notifications.events().registerRemoteNotificationsRegistrationFailed((e) => {
                console.error(e);
                resolve(false);
            });

            Notifications.events().registerRemoteNotificationsRegistrationDenied(() => {
                resolve(false);
            });
        });
    }

    private async onTokenRefresh(token: string): Promise<void> {
        await this.refreshPersistedToken(this._userManager.user?.user.id, token);
    }

    private async onBackgroundNotification(message: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
        // Do something with background messages
    }

    private async onForegroundNotification(message: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
        // Do something with foreground messages
        const typeCode = parseInt(`${message.data?.type}` || "");
        if (isNaN(typeCode)) return;
        this._messageHub.publishForegroundNotificationReceived(
            new PushMessage(typeCode, message.data, message.notification),
        );
    }

    private async onNotificationOpened(message: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
        await this._appManager.initialized;
        const typeCode = parseInt(`${message.data?.type}` || "");
        if (isNaN(typeCode)) return;

        const handler = this._pushMessageHandlerProvder.provide({ ...message, type: typeCode as NotificationType });
        handler();
    }

    private async onSignoutRequested(): Promise<void> {
        await this.refreshPersistedToken(undefined, "");
    }

    private async onUserUpdated(user: UserCredential | null): Promise<void> {
        // Signout handled separately
        if (!user) {
            return;
        }

        const token = messaging().isDeviceRegisteredForRemoteMessages ? await messaging().getToken() : "";

        await this.refreshPersistedToken(user.user.id, token);
    }

    private async onPushNotificationSettingsChanged(allowed: boolean): Promise<void> {
        if (!allowed && messaging().isDeviceRegisteredForRemoteMessages) {
            await messaging().unregisterDeviceForRemoteMessages();
            await this.refreshPersistedToken(undefined, "");
        } else if (allowed && !messaging().isDeviceRegisteredForRemoteMessages) {
            await messaging().registerDeviceForRemoteMessages();

            const token = await messaging().getToken();
            await this.refreshPersistedToken(this._userManager.userId, token);
        }
    }

    private async refreshPersistedToken(currentUserId: string | undefined, token: string): Promise<void> {
        const credentials = (await getInternetCredentials(NotificationManager.SERVICE_NAME)) || undefined;

        await this._api.updateToken({
            newUserId: currentUserId,
            newDeviceToken: token,
            oldUserId: credentials?.username,
            oldDeviceToken: credentials?.password,
        });

        if (currentUserId) {
            await setInternetCredentials(NotificationManager.SERVICE_NAME, currentUserId, token);
        } else {
            await resetInternetCredentials(NotificationManager.SERVICE_NAME);
        }
    }
}
