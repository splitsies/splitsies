import { IExpenseDto, IExpenseItem, IExpensePayerDto, IExpenseUserDetails } from "@splitsies/shared-models";
import { Observable } from "rxjs";
import { IUserExpenseDto } from "../../models/user-expense-dto/user-expense-dto-interface";
import { IBaseManager } from "../../managers/base-manager-interface";

export interface IExpenseApiClient extends IBaseManager {
    readonly sessionExpense$: Observable<IExpenseDto | null>;
    getAllExpenses(reset?: boolean): Promise<IExpenseDto[]>;
    getExpense(expenseId: string): Promise<void>;
    getUserIdsForExpense(expenseId: string): Promise<string[]>;
    connectToExpense(expenseId: string): Promise<void>;
    pingConnection(): Promise<void>;
    disconnectFromExpense(): void;
    addUserToExpense(userId: string, expenseId: string, requestingUserId?: string): Promise<void>;
    removeUserFromExpense(userId: string, expenseId: string): Promise<void>;
    createFromExpense(expense: IExpenseDto): Promise<boolean>;
    createExpense(base64Image?: string): Promise<boolean>;
    getExpenseJoinRequests(reset?: boolean): Promise<IUserExpenseDto[]>;
    getExpenseJoinRequestCount(): Promise<number>;
    removeExpenseJoinRequest(expenseId: string, userId?: string): Promise<void>;
    sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void>;
    requestSetExpensePayers(expensePayerDto: IExpensePayerDto): Promise<void>;
    requestSetExpensePayerStatus(expenseId: string, userId: string, settled: boolean): Promise<void>;
    requestAddToExpenseGroup(expenseId: string, expense?: IExpenseDto): Promise<void>;
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
    updateSessionExpense(expenseDto: IExpenseDto | null): void;
}

export const IExpenseApiClient = Symbol.for("IExpenseApiClient");
