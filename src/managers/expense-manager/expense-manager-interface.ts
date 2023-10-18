import { IExpense } from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IExpenseManager {
    readonly expenses: IExpense[];
    readonly expenses$: Observable<IExpense[]>;

    readonly currentExpense: IExpense | null;
    readonly currentExpense$: Observable<IExpense | null>;

    requestForUser(userId: string): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    updateExpense(expense: IExpense): Promise<void>;
    addItemToExpense(id: string, name: string, price: number, owners: string[], isProportional: boolean): Promise<void>;
    disconnectFromExpense(): void;
}

export const IExpenseManager = Symbol.for("IExpenseManager");
