import { IExpenseDto } from "@splitsies/shared-models";
import { IBaseManager } from "../../managers/base-manager-interface";

export interface INotificationApiClient extends IBaseManager {
    updateToken(params: {
        newUserId?: string;
        newDeviceToken?: string;
        oldUserId?: string;
        oldDeviceToken?: string;
    }): Promise<void>;
}

export const INotificationApiClient = Symbol.for("INotificationApiClient");
