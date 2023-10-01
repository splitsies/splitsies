import { IExpense } from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IExpenseManager {
    readonly expenses: IExpense[];
    readonly expenses$: Observable<IExpense[]>;

    readonly currentExpense: IExpense | null;
    readonly currentExpense$: Observable<IExpense | null>;

    requestForUser(userId: string): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    disconnectFromExpense(): void;
}

export const IExpenseManager = Symbol.for("IExpenseManager");
