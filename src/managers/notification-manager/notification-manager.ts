import { injectable } from "inversify";
import { BaseManager } from "../base-manager";
import { lazyInject } from "../../utils/lazy-inject";
import { IPersmissionRequester } from "../../utils/permission-requester/permission-requester-interface";
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { INotificationManager } from "./notification-manager-interface";
import { IUserManager } from "../user-manager/user-manager-interface";
import { getInternetCredentials, resetInternetCredentials, setInternetCredentials } from "react-native-keychain";
import { INotificationApiClient } from "../../api/notification-api-client/notification-api-client-interface";

@injectable()
export class NotificationManager extends BaseManager implements INotificationManager {
    private static readonly SERVICE_NAME = "NotificationService";

    private readonly _permissionRequester = lazyInject<IPersmissionRequester>(IPersmissionRequester);
    private readonly _userManager = lazyInject<IUserManager>(IUserManager);
    private readonly _api = lazyInject<INotificationApiClient>(INotificationApiClient);

    constructor() {
        super();
    }

    protected async initialize(): Promise<void> {
        const status = await this._permissionRequester.requestPushNotificationPermission();
        if (status !== "granted") {
            return;
        }

        if (!messaging().isDeviceRegisteredForRemoteMessages) {
            await messaging().registerDeviceForRemoteMessages();
        }

        await this._userManager.initialized;

        this._userManager.user$.subscribe({
            next: async (user) => {
                const token = await messaging().getToken();
                await this.refreshPersistedToken(user?.user.id, token);
            },
        });

        messaging().onTokenRefresh(async (token) => {
            await this.refreshPersistedToken(this._userManager.user?.user.id, token);
        });

        messaging().setBackgroundMessageHandler(this.onBackgroundNotification.bind(this));
        messaging().onMessage(this.onForegroundNotification.bind(this));
    }

    private async onBackgroundNotification(message: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
        console.log({
            type: "background",
            message,
        });
    }

    private async onForegroundNotification(message: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
        console.log({
            type: "foreground",
            message,
        });
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
