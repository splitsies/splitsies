import { IExpense, IExpenseUpdate } from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IExpenseApiClient {
    readonly userExpenses$: Observable<IExpense[]>;
    readonly sessionExpense$: Observable<IExpense | null>;
    getAllExpenses(userId: string): Promise<void>;
    getExpense(expenseId: string): Promise<void>;
    updateExpense(expense: IExpense): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    disconnectFromExpense(): void;
    addItemToExpense(id: string, name: string, price: number, owners: string[], isProportional: boolean): Promise<void>;
}

export const IExpenseApiClient = Symbol.for("IExpenseApiClient");
