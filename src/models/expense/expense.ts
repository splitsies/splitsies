import { IExpenseItem, IExpenseUserDetails, IUserDto } from "@splitsies/shared-models";
import { IExpense } from "./expense-interface";

export class Expense implements IExpense {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly transactionDate: Date,
        readonly items: IExpenseItem[],
        readonly users: IExpenseUserDetails[]
    ) {}

    get subtotal(): number {
        return this.items.filter((i) => !i.isProportional).reduce((prev, curr) => prev + curr.price, 0);
    }

    get total(): number {
        return this.items.reduce((prev, curr) => prev + curr.price, 0);
    }
}
