import { ExpensePayerStatus, IExpenseItem, IExpenseUserDetails, IPayerShare } from "@splitsies/shared-models";

export interface IExpense {
    readonly id: string;
    readonly name: string;
    readonly transactionDate: Date;
    readonly items: IExpenseItem[];
    readonly users: IExpenseUserDetails[];
    readonly subtotal: number;
    readonly total: number;
    readonly payers: IPayerShare[];
    readonly payerStatuses: ExpensePayerStatus[];
    readonly children: IExpense[];
    readonly groupTotal: number;
    readonly groupable: boolean;
}
