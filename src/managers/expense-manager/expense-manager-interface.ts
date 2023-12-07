import { IExpense, IExpenseUserDetails, IUserDto } from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IExpenseManager {
    readonly expenses: IExpense[];
    readonly expenses$: Observable<IExpense[]>;

    readonly currentExpense: IExpense | null;
    readonly currentExpense$: Observable<IExpense | null>;

    readonly currentExpenseUsers: IExpenseUserDetails[];
    readonly currentExpenseUsers$: Observable<IExpenseUserDetails[]>;

    requestForUser(userId: string): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    updateExpense(expense: IExpense): Promise<void>;
    addItemToExpense(id: string, name: string, price: number, owners: string[], isProportional: boolean): Promise<void>;
    disconnectFromExpense(): void;
    requestAddUserToExpense(userId: string, expenseId: string): Promise<void>;
    requestRemoveUserFromExpense(userId: string, expenseId: string): Promise<void>;
}

export const IExpenseManager = Symbol.for("IExpenseManager");
