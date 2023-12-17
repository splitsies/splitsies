import {
    IExpense,
    IExpenseJoinRequest,
    IExpenseJoinRequestDto,
    IExpensePayload,
    IExpenseUserDetails,
} from "@splitsies/shared-models";
import { Observable } from "rxjs";

export interface IExpenseManager {
    readonly expenses: IExpensePayload[];
    readonly expenses$: Observable<IExpensePayload[]>;

    readonly currentExpense: IExpense | null;
    readonly currentExpense$: Observable<IExpense | null>;

    readonly currentExpenseUsers: IExpenseUserDetails[];
    readonly currentExpenseUsers$: Observable<IExpenseUserDetails[]>;

    readonly isPendingExpenseData: boolean;
    readonly isPendingExpenseData$: Observable<boolean>;

    readonly expenseJoinRequests$: Observable<IExpenseJoinRequestDto[]>;
    readonly currentExpenseJoinRequests$: Observable<IExpenseJoinRequest[]>;

    requestForUser(): Promise<void>;
    connectToExpense(expenseId: string): Promise<void>;
    updateExpense(expense: IExpense): Promise<void>;
    addItemToExpense(id: string, name: string, price: number, owners: string[], isProportional: boolean): Promise<void>;
    disconnectFromExpense(): void;
    requestAddUserToExpense(userId: string, expenseId: string): Promise<void>;
    requestRemoveUserFromExpense(userId: string, expenseId: string): Promise<void>;
    requestUsersForExpense(expenseId: string): Promise<void>;
    createExpense(base64Image?: string): Promise<boolean>;
    requestExpenseJoinRequests(): Promise<void>;
    removeExpenseJoinRequestForUser(expenseId: string, userId?: string): Promise<void>;
    sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void>;
    getJoinRequestsForExpense(expenseId: string): Promise<void>;
}

export const IExpenseManager = Symbol.for("IExpenseManager");
