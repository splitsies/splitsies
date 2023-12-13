import { injectable } from "inversify";
import { IExpenseManager } from "./expense-manager-interface";
import {
    IExpense,
    IExpenseJoinRequest,
    IExpenseJoinRequestDto,
    IExpensePayload,
    IExpenseUserDetails,
    IExpenseUserDetailsMapper,
    IUserCredential,
} from "@splitsies/shared-models";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpenseApiClient } from "../../api/expense-api-client/expense-api-client-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { BaseManager } from "../base-manager";
import { IUserManager } from "../user-manager/user-manager-interface";

@injectable()
export class ExpenseManager extends BaseManager implements IExpenseManager {
    private readonly _api = lazyInject<IExpenseApiClient>(IExpenseApiClient);
    private readonly _userManager = lazyInject<IUserManager>(IUserManager);
    private readonly _expenseUserDetailsMapper = lazyInject<IExpenseUserDetailsMapper>(IExpenseUserDetailsMapper);
    private readonly _expenses$ = new BehaviorSubject<IExpensePayload[]>([]);
    private readonly _currentExpense$ = new BehaviorSubject<IExpense | null>(null);
    private readonly _currentExpenseUsers$ = new BehaviorSubject<IExpenseUserDetails[]>([]);
    private readonly _isPendingExpenseData$ = new BehaviorSubject<boolean>(false);
    private readonly _expenseJoinRequests$ = new BehaviorSubject<IExpenseJoinRequestDto[]>([]);
    private readonly _currentExpenseJoinRequests$ = new BehaviorSubject<IExpenseJoinRequest[]>([]);

    get expenses$(): Observable<IExpensePayload[]> {
        return this._expenses$.asObservable();
    }

    get expenses(): IExpensePayload[] {
        return this._expenses$.value;
    }

    get currentExpense$(): Observable<IExpense | null> {
        return this._currentExpense$.asObservable();
    }

    get currentExpense(): IExpense | null {
        return this._currentExpense$.value;
    }

    get currentExpenseUsers$(): Observable<IExpenseUserDetails[]> {
        return this._currentExpenseUsers$.asObservable();
    }

    get currentExpenseUsers(): IExpenseUserDetails[] {
        return this._currentExpenseUsers$.value;
    }

    get isPendingExpenseData(): boolean {
        return this._isPendingExpenseData$.value;
    }

    get isPendingExpenseData$(): Observable<boolean> {
        return this._isPendingExpenseData$.asObservable();
    }

    get expenseJoinRequests$(): Observable<IExpenseJoinRequestDto[]> {
        return this._expenseJoinRequests$.asObservable();
    }

    get currentExpenseJoinRequests$(): Observable<IExpenseJoinRequest[]> {
        return this._currentExpenseJoinRequests$.asObservable();
    }

    constructor() {
        super();
    }

    addItemToExpense(
        id: string,
        name: string,
        price: number,
        owners: string[],
        isProportional: boolean,
    ): Promise<void> {
        return this._api.addItemToExpense(id, name, price, owners, isProportional);
    }

    protected async initialize(): Promise<void> {
        await this._userManager.initialized;
        this._userManager.user$.subscribe({
            next: (user) => this.onUserCredentialUpdated(user),
        });

        this._api.userExpenses$.subscribe({
            next: (data) => this._expenses$.next(data),
        });

        this._api.sessionExpense$.subscribe({
            next: (data) => this._currentExpense$.next(data),
        });

        this._api.sessionExpenseJoinRequests$.subscribe({
            next: (requests) => this._currentExpenseJoinRequests$.next(requests)
        });
    }

    async requestForUser(userId: string): Promise<void> {
        this._api.getAllExpenses(userId);
    }

    async connectToExpense(expenseId: string): Promise<void> {
        await this._api.connectToExpense(expenseId);
        await this.getJoinRequestsForExpense(expenseId);
    }

    async requestUsersForExpense(expenseId: string): Promise<void> {
        const userIds = await this._api.getUserIdsForExpense(expenseId);
        console.log(`users for expense=${expenseId}  are ${userIds.join(',')}`);
        const users = await this._userManager.requestUsersByIds(userIds);

        this._currentExpenseUsers$.next(
            users.map((u) => this._expenseUserDetailsMapper.fromUserDto(u)).sort(this.userSortCompare),
        );
    }

    async requestAddUserToExpense(userId: string, expenseId: string): Promise<void> {
        console.log(`adding user ${userId} to expense ${expenseId}`);
        await this._api.addUserToExpense(userId, expenseId);
        void this.requestUsersForExpense(expenseId);
    }

    async requestRemoveUserFromExpense(userId: string, expenseId: string): Promise<void> {
        await this._api.removeUserFromExpense(userId, expenseId);
        void this.requestUsersForExpense(expenseId);
    }

    disconnectFromExpense(): void {
        this._api.disconnectFromExpense();
    }

    createExpense(base64Image?: string): Promise<boolean> {
        return this._api.createExpense(base64Image);
    }

    async requestExpenseJoinRequests(): Promise<void> {
        const requests = await this._api.getExpenseJoinRequests();
        this._expenseJoinRequests$.next(requests);
    }

    removeExpenseJoinRequest(expenseId: string): Promise<void> {
        return this._api.removeExpenseJoinRequest(expenseId);
    }

    sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void> {
        return this._api.sendExpenseJoinRequest(userId, expenseId);
    }

    async getJoinRequestsForExpense(expenseId: string): Promise<void> {
        await this._api.getJoinRequestsForExpense(expenseId);
    }

    updateExpense(expense: IExpense): Promise<void> {
        return this._api.updateExpense(expense);
    }

    private async onUserCredentialUpdated(userCredential: IUserCredential | null): Promise<void> {
        this._isPendingExpenseData$.next(true);
        try {
            this._api.disconnectFromExpense();
            await this._api.getAllExpenses(userCredential?.user.id ?? "");
        } finally {
            this._isPendingExpenseData$.next(false);
        }
    }

    private userSortCompare(user1: IExpenseUserDetails, user2: IExpenseUserDetails): number {
        return user1.givenName.toUpperCase() > user2.givenName.toUpperCase()
            ? 1
            : user1.givenName.toUpperCase() < user2.givenName.toUpperCase()
            ? -1
            : 0;
    }
}
