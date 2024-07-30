import { IExpenseItem, IExpenseUserDetails, IPayerShare } from "@splitsies/shared-models";

export interface IExpense {
    readonly id: string;
    readonly name: string;
    readonly transactionDate: Date;
    readonly items: IExpenseItem[];
    readonly users: IExpenseUserDetails[];
    readonly subtotal: number;
    readonly total: number;
    readonly payers: IPayerShare[];
}
