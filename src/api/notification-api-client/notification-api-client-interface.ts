import { IExpenseDto } from "@splitsies/shared-models";

export interface INotificationApiClient {
    updateToken(params: {
        newUserId?: string;
        newDeviceToken?: string;
        oldUserId?: string;
        oldDeviceToken?: string;
    }): Promise<void>;
}

export const INotificationApiClient = Symbol.for("INotificationApiClient");
