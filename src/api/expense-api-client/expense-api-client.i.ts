import { IExpenseDto, IExpensePayerDto } from "@splitsies/shared-models";
import { IUserExpenseDto } from "../../models/user-expense-dto/user-expense-dto-interface";
import { IBaseManager } from "../../managers/base-manager-interface";

export interface IExpenseApiClient extends IBaseManager {
    getAllExpenses(reset?: boolean): Promise<IExpenseDto[]>;
    getExpense(expenseId: string): Promise<IExpenseDto | null>;
    getUserIdsForExpense(expenseId: string): Promise<string[]>;
    addUserToExpense(userId: string, expenseId: string, requestingUserId?: string): Promise<void>;
    removeUserFromExpense(userId: string, expenseId: string): Promise<void>;
    createFromExpense(expense: IExpenseDto): Promise<IExpenseDto | null>;
    createExpense(base64Image?: string): Promise<IExpenseDto | null>;
    getExpenseJoinRequests(reset?: boolean): Promise<IUserExpenseDto[]>;
    getExpenseJoinRequestCount(): Promise<number>;
    removeExpenseJoinRequest(expenseId: string, userId?: string): Promise<void>;
    sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void>;
    requestSetExpensePayers(expensePayerDto: IExpensePayerDto): Promise<void>;
    requestSetExpensePayerStatus(expenseId: string, userId: string, settled: boolean): Promise<void>;
    requestAddToExpenseGroup(expenseId: string, expense?: IExpenseDto): Promise<void>;
    addExistingExpenseToGroup(groupExpenseId: string, childExpenseId: string): Promise<void>;
    removeExpenseFromGroup(groupExpenseId: string, childExpenseId: string): Promise<void>;
    deleteExpense(expenseId: string): Promise<void>;
}

export const IExpenseApiClient = Symbol.for("IExpenseApiClient");
