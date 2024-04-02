import { IExpenseDto } from "@splitsies/shared-models";

export interface IUserExpenseDto {
    readonly expense: IExpenseDto;
    readonly userId: string;
    readonly pendingJoin: boolean;
    readonly requestingUserId?: string;
    readonly createdAt?: Date;
}
