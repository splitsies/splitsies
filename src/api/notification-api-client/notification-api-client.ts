import { injectable } from "inversify";
import { INotificationApiClient } from "./notification-api-client-interface";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { ClientBase } from "../client-base";
import { lazyInject } from "../../utils/lazy-inject";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";

@injectable()
export class NotificationApiClient extends ClientBase implements INotificationApiClient {
    private readonly _config = lazyInject<IApiConfig>(IApiConfig);
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);

    constructor() {
        super();
    }

    async updateToken(params: {
        newUserId?: string;
        newDeviceToken?: string;
        oldUserId?: string;
        oldDeviceToken?: string;
    }): Promise<void> {
        const uri = `${this._config.notification}v1/tokens`;

        const { newUserId, newDeviceToken, oldUserId, oldDeviceToken } = params;
        const oldToken = oldUserId && oldDeviceToken ? { userId: oldUserId, deviceToken: oldDeviceToken } : undefined;
        const newToken = newUserId && newDeviceToken ? { userId: newUserId, deviceToken: newDeviceToken } : undefined;

        if (!oldToken && !newToken) return;

        try {
            await this.putJson<any>(
                uri,
                {
                    oldToken,
                    newToken,
                },
                this._authProvider.provideAuthHeader(),
            );
        } catch (e) {
            console.error(`Error on request: ${e}`);
        }
    }
}
