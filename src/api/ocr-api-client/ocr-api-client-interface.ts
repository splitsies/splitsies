import { IExpenseDto } from "@splitsies/shared-models";
import { IBaseManager } from "../../managers/base-manager-interface";

export interface IOcrApiClient extends IBaseManager {
    preflight(): Promise<void>;
    scanImage(base64Image: string): Promise<IExpenseDto | null>;
}

export const IOcrApiClient = Symbol.for("IOcrApiClient");
