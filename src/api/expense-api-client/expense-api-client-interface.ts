import {
    IExpenseDto,
    IExpenseItem,
    IExpenseJoinRequest,
    IExpenseJoinRequestDto,
    IExpenseUserDetails,
    IUserCredential,
} from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IExpenseApiClient {
    readonly sessionExpense$: Observable<IExpenseDto | null>;
    readonly sessionExpenseJoinRequests$: Observable<IExpenseJoinRequest[]>;
    getAllExpenses(userCred?: IUserCredential): Promise<IExpenseDto[]>;
    getExpense(expenseId: string): Promise<void>;
    getUserIdsForExpense(expenseId: string): Promise<string[]>;
    connectToExpense(expenseId: string): Promise<void>;
    disconnectFromExpense(): void;
    addUserToExpense(userId: string, expenseId: string): Promise<void>;
    removeUserFromExpense(userId: string, expenseId: string): Promise<void>;
    createFromExpense(expense: IExpenseDto): Promise<boolean>;
    createExpense(base64Image?: string): Promise<boolean>;
    getExpenseJoinRequests(): Promise<IExpenseJoinRequestDto[]>;
    removeExpenseJoinRequest(expenseId: string, userId?: string): Promise<void>;
    sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void>;
    getJoinRequestsForExpense(expenseId: string): Promise<IExpenseJoinRequest[]>;
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

export const IExpenseApiClient = Symbol.for("IExpenseApiClient");
