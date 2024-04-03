import { IExpenseUserDetails } from "@splitsies/shared-models";
import { IExpenseJoinRequest } from "./expense-join-request-interface";
import { IExpense } from "../expense/expense-interface";

export class ExpenseJoinRequest implements IExpenseJoinRequest {
    constructor(
        readonly userId: string,
        readonly expense: IExpense,
        readonly requestingUser: IExpenseUserDetails,
        readonly createdAt: Date,
    ) {}
}
