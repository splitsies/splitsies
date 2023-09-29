import { IExpense, IExpenseUpdate } from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IExpenseApiClient {
    readonly userExpenses$: Observable<IExpense[]>;
    readonly sessionExpense$: Observable<IExpense | null>;
    getAllExpenses(userId: string): Promise<void>;
    getExpense(expenseId: string): Promise<void>;
    updateExpense(update: IExpenseUpdate): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    disconnectFromExpense(): void;
}

export const IExpenseApiClient = Symbol.for("IExpenseApiClient");
