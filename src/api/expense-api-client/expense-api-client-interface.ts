import { IExpense, IExpensePayload } from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IExpenseApiClient {
    readonly userExpenses$: Observable<IExpensePayload[]>;
    readonly sessionExpense$: Observable<IExpense | null>;
    getAllExpenses(userId: string): Promise<void>;
    getExpense(expenseId: string): Promise<void>;
    getUserIdsForExpense(expenseId: string): Promise<string[]>;
    updateExpense(expense: IExpense): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    disconnectFromExpense(): void;
    addItemToExpense(id: string, name: string, price: number, owners: string[], isProportional: boolean): Promise<void>;
    addUserToExpense(userId: string, expenseId: string): Promise<void>;
    removeUserFromExpense(userId: string, expenseId: string): Promise<void>;
}

export const IExpenseApiClient = Symbol.for("IExpenseApiClient");
