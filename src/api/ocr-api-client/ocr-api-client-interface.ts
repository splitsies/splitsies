import { IExpenseDto } from "@splitsies/shared-models";

export interface IOcrApiClient {
    scanImage(base64Image: string): Promise<IExpenseDto | null>;
}

export const IOcrApiClient = Symbol.for("IOcrApiClient");
