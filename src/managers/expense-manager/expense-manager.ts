import { injectable } from "inversify";
import { IExpenseManager } from "./expense-manager-interface";
import {
    IExpenseDto,
    IExpenseItem,
    IExpenseJoinRequest,
    IExpenseJoinRequestDto,
    IExpenseUserDetails,
    IExpenseUserDetailsMapper,
    IUserCredential,
} from "@splitsies/shared-models";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpenseApiClient } from "../../api/expense-api-client/expense-api-client-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { BaseManager } from "../base-manager";
import { IUserManager } from "../user-manager/user-manager-interface";
import { IExpense } from "../../models/expense/expense-interface";
import { IExpenseMapper } from "../../mappers/expense-mapper-interface";
import { IOcrApiClient } from "../../api/ocr-api-client/ocr-api-client-interface";

@injectable()
export class ExpenseManager extends BaseManager implements IExpenseManager {
    private readonly _api = lazyInject<IExpenseApiClient>(IExpenseApiClient);
    private readonly _ocr = lazyInject<IOcrApiClient>(IOcrApiClient);
    private readonly _userManager = lazyInject<IUserManager>(IUserManager);
    private readonly _expenseMapper = lazyInject<IExpenseMapper>(IExpenseMapper);
    private readonly _expenseUserDetailsMapper = lazyInject<IExpenseUserDetailsMapper>(IExpenseUserDetailsMapper);
    private readonly _expenses$ = new BehaviorSubject<IExpense[]>([]);
    private readonly _currentExpense$ = new BehaviorSubject<IExpense | null>(null);
    private readonly _currentExpenseUsers$ = new BehaviorSubject<IExpenseUserDetails[]>([]);
    private readonly _isPendingExpenseData$ = new BehaviorSubject<boolean>(false);
    private readonly _expenseJoinRequests$ = new BehaviorSubject<IExpenseJoinRequestDto[]>([]);
    private readonly _currentExpenseJoinRequests$ = new BehaviorSubject<IExpenseJoinRequest[]>([]);

    get expenses$(): Observable<IExpense[]> {
        return this._expenses$.asObservable();
    }

    get expenses(): IExpense[] {
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

    protected async initialize(): Promise<void> {
        await this._userManager.initialized;

        this._userManager.user$.subscribe({
            next: (user) => this.onUserCredentialUpdated(user),
        });

        this._api.sessionExpense$.subscribe({
            next: (data) => void this.onSessionExpenseUpdated(data)
        });

        this._api.sessionExpenseJoinRequests$.subscribe({
            next: (requests) => this._currentExpenseJoinRequests$.next(requests),
        });

        await this.requestExpenseJoinRequests();
    }

    async requestForUser(): Promise<void> {
        const expenseDtos = await this._api.getAllExpenses();
        const expenses = await Promise.all(expenseDtos.map(dto => this._expenseMapper.toDomain(dto)));
        this._expenses$.next(expenses.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()));
    }

    async connectToExpense(expenseId: string): Promise<void> {
        await this._api.connectToExpense(expenseId);
        void this.getJoinRequestsForExpense(expenseId);
    }

    async requestUsersForExpense(expenseId: string): Promise<void> {
        const userIds = await this._api.getUserIdsForExpense(expenseId);
        const users = await this._userManager.requestUsersByIds(userIds);

        if (this.currentExpense?.id === expenseId) {
            this._currentExpenseUsers$.next(
                users.map((u) => this._expenseUserDetailsMapper.fromUserDto(u)).sort(this.userSortCompare),
            );
        }
    }

    requestAddUserToExpense(userId: string, expenseId: string): Promise<void> {
        return this._api.addUserToExpense(userId, expenseId);
    }

    async requestRemoveUserFromExpense(userId: string, expenseId: string): Promise<void> {
        await this._api.removeUserFromExpense(userId, expenseId);
    }

    disconnectFromExpense(): void {
        this._api.disconnectFromExpense();
    }

    async createExpense(base64Image?: string): Promise<boolean> {
        if (base64Image) {
            const expense = await this._ocr.scanImage(base64Image);
            if (!expense) return false;
            
            return this._api.createFromExpense(expense);
        }
        return this._api.createExpense(base64Image);
    }

    async requestExpenseJoinRequests(): Promise<void> {
        const requests = await this._api.getExpenseJoinRequests();
        this._expenseJoinRequests$.next(requests.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
    }

    async removeExpenseJoinRequestForUser(expenseId: string, userId: string | undefined = undefined): Promise<void> {
        await this._api.removeExpenseJoinRequest(expenseId, userId);
        const requests = this._expenseJoinRequests$.value;
        const requestIndex = requests.findIndex((r) => r.expenseId === expenseId);
        if (requestIndex === -1) return;

        requests.splice(requestIndex, 1);
        this._expenseJoinRequests$.next(requests);
    }

    sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void> {
        return this._api.sendExpenseJoinRequest(userId, expenseId);
    }

    async getJoinRequestsForExpense(expenseId: string): Promise<void> {
        await this._api.getJoinRequestsForExpense(expenseId);
    }

    addItem(
        expenseId: string,
        itemName: string,
        itemPrice: number,
        itemOwners: IExpenseUserDetails[],
        isItemProportional: boolean,
    ): void {
        this._api.addItem(expenseId, itemName, itemPrice, itemOwners, isItemProportional);
    }

    removeItem(expenseId: string, item: IExpenseItem): void {
        this._api.removeItem(expenseId, item);
    }

    updateItemSelections(expenseId: string, user: IExpenseUserDetails, selectedItemIds: string[]): void {
        this._api.updateItemSelections(expenseId, user, selectedItemIds);
    }

    updateItemDetails(
        expenseId: string,
        item: IExpenseItem,
        itemName: string,
        itemPrice: number,
        isItemProportional: boolean,
    ): void {
        this._api.updateItemDetails(expenseId, item, itemName, itemPrice, isItemProportional);
    }

    updateExpenseName(expenseId: string, expenseName: string): void {
        this._api.updateExpenseName(expenseId, expenseName);
    }

    updateExpenseTransactionDate(expenseId: string, transactionDate: Date): void {
        this._api.updateExpenseTransactionDate(expenseId, transactionDate);
    }

    private async onSessionExpenseUpdated(expenseDto: IExpenseDto | null): Promise<void> {
        if (expenseDto == null) {
            await this.requestForUser();
            this._currentExpense$.next(null);
            return;
        }

        const expense = await this._expenseMapper.toDomain(expenseDto);
        this._currentExpense$.next(expense);

        const expenses = [...this.expenses];
        const expenseIndex = expenses.findIndex((e) => e.id === expenseDto.id);
        if (expenseIndex === -1) {
            return;
        }

        expenses[expenseIndex] = expense;

        this._expenses$.next(
            expenses.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime())            
        );
    }

    private async onUserCredentialUpdated(userCredential: IUserCredential | null): Promise<void> {
        this._isPendingExpenseData$.next(true);
        try {
            this._api.disconnectFromExpense();
            await this.requestForUser();
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
