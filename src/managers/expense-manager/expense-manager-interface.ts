import { IExpenseItem, IExpenseUserDetails } from "@splitsies/shared-models";
import { Observable } from "rxjs";
import { IExpense } from "../../models/expense/expense-interface";
import { IExpenseJoinRequest } from "../../models/expense-join-request/expense-join-request-interface";

export interface IExpenseManager {
    readonly expenses: IExpense[];
    readonly expenses$: Observable<IExpense[]>;

    readonly currentExpense: IExpense | null;
    readonly currentExpense$: Observable<IExpense | null>;

    readonly isPendingExpenseData: boolean;
    readonly isPendingExpenseData$: Observable<boolean>;

    readonly expenseJoinRequests$: Observable<IExpenseJoinRequest[]>;
    readonly expenseJoinRequestCount$: Observable<number>;

    requestForUser(reset?: boolean): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    disconnectFromExpense(): void;
    requestAddUserToExpense(userId: string, expenseId: string): Promise<void>;
    requestRemoveUserFromExpense(userId: string, expenseId: string): Promise<void>;
    createExpense(base64Image?: string): Promise<boolean>;
    requestExpenseJoinRequests(reset?: boolean): Promise<void>;
    removeExpenseJoinRequestForUser(expenseId: string, userId?: string): Promise<void>;
    requestSetExpensePayers(expenseId: string, userId: string): Promise<void>;
    requestSetExpensePayerStatus(expenseId: string, userId: string, settled: boolean): Promise<void>;
    sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void>;
    getExpenseJoinRequestCount(): Promise<void>;
    addItem(
        expenseId: string,
        itemName: string,
        itemPrice: number,
        itemOwners: IExpenseUserDetails[],
        isItemProportional: boolean,
    ): void;
    removeItem(expenseId: string, item: IExpenseItem): void;
    updateItemSelections(expenseId: string, user: IExpenseUserDetails, selectedItemIds: string[]): void;
    updateItemDetails(
        expenseId: string,
        item: IExpenseItem,
        itemName: string,
        itemPrice: number,
        isItemProportional: boolean,
    ): void;
    updateExpenseName(expenseId: string, expenseName: string): void;
    updateExpenseTransactionDate(expenseId: string, transactionDate: Date): void;
}

export const IExpenseManager = Symbol.for("IExpenseManager");
