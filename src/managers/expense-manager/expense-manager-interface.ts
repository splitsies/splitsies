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
    refreshCurrentExpense(): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    disconnectFromExpense(): void;
    requestAddUserToExpense(userId: string, expenseId: string, requestingUserId?: string): Promise<void>;
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
    updateSingleItemSelected(
        expenseId: string,
        user: IExpenseUserDetails,
        item: IExpenseItem,
        itemSelected: boolean,
    ): void;

    /**
     * @deprecated Do not use unless warranted, specifically to reduce server latency in
     * updating the current expense
     */
    updateCurrentExpense(expense: IExpense): void;

    /**
     * Sends a ping event to the image scan function to ensure a warm execution
     * environment by the time the receipt needs to be scanned
     */
    scanPreflight(): Promise<void>;
}

export const IExpenseManager = Symbol.for("IExpenseManager");
