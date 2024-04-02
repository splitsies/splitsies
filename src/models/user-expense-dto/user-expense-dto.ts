import { IExpenseDto } from "@splitsies/shared-models";
import { IUserExpenseDto } from "./user-expense-dto-interface";

export class UserExpenseDto implements IUserExpenseDto {
    constructor(
        readonly expense: IExpenseDto,
        readonly userId: string,
        readonly pendingJoin: boolean,
        readonly requestingUserId?: string,
        readonly createdAt?: Date,
    ) {}
}
