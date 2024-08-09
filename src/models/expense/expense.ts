import { ExpensePayerStatus, IExpenseItem, IExpenseUserDetails, IPayerShare } from "@splitsies/shared-models";
import { IExpense } from "./expense-interface";

export class Expense implements IExpense {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly transactionDate: Date,
        readonly items: IExpenseItem[],
        readonly users: IExpenseUserDetails[],
        readonly payers: IPayerShare[],
        readonly payerStatuses: ExpensePayerStatus[],
        readonly children: IExpense[],
    ) {}

    get groupable(): boolean {
        return this.items.length === 0 || this.children.length > 0;
    }

    get subtotal(): number {
        return this.items.filter((i) => !i.isProportional).reduce((prev, curr) => prev + curr.price, 0);
    }

    get total(): number {
        return this.items.reduce((prev, curr) => prev + curr.price, 0);
    }

    get groupTotal(): number {
        return this.total + this.children.reduce((prev, curr) => prev + curr.total, 0);
    }
}
