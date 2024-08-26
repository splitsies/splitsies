import { IExpenseDto, IExpenseItem, IExpenseUserDetails } from "@splitsies/shared-models";
import { Observable } from "rxjs";
import { IBaseManager } from "../../managers/base-manager-interface";

export interface IExpenseSocketClient extends IBaseManager {
    readonly sessionExpense$: Observable<IExpenseDto | null>;
    getExpense(expenseId: string): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    pingConnection(): Promise<void>;
    disconnectFromExpense(): void;
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

export const IExpenseSocketClient = Symbol.for("IExpenseSocketClient");
