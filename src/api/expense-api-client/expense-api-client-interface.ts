import {
    IExpense,
    IExpenseJoinRequest,
    IExpenseJoinRequestDto,
    IExpensePayload,
    IExpenseUserDetails,
    IUserCredential,
} from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IExpenseApiClient {
    readonly userExpenses$: Observable<IExpensePayload[]>;
    readonly sessionExpense$: Observable<IExpense | null>;
    readonly sessionExpenseUsers$: Observable<IExpenseUserDetails[]>;
    readonly sessionExpenseJoinRequests$: Observable<IExpenseJoinRequest[]>;
    getAllExpenses(userCred?: IUserCredential): Promise<void>;
    getExpense(expenseId: string): Promise<void>;
    getUserIdsForExpense(expenseId: string): Promise<string[]>;
    updateExpense(expense: IExpense): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    disconnectFromExpense(): void;
    addItemToExpense(id: string, name: string, price: number, owners: string[], isProportional: boolean): Promise<void>;
    addUserToExpense(userId: string, expenseId: string): Promise<void>;
    removeUserFromExpense(userId: string, expenseId: string): Promise<void>;
    createExpense(base64Image?: string): Promise<boolean>;
    getExpenseJoinRequests(): Promise<IExpenseJoinRequestDto[]>;
    removeExpenseJoinRequest(expenseId: string, userId?: string): Promise<void>;
    sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void>;
    getJoinRequestsForExpense(expenseId: string): Promise<IExpenseJoinRequest[]>;
}

export const IExpenseApiClient = Symbol.for("IExpenseApiClient");
