import { IExpenseUserDetails } from "@splitsies/shared-models";
import { IExpense } from "../expense/expense-interface";

export interface IExpenseJoinRequest {
    readonly userId: string;
    readonly expense: IExpense;
    readonly requestingUser: IExpenseUserDetails;
    readonly createdAt: Date;
}
