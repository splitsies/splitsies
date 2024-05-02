import { injectable } from "inversify";
import { IExpenseManager } from "./expense-manager-interface";
import { IExpenseDto, IExpenseItem, IExpenseUserDetails, IUserCredential } from "@splitsies/shared-models";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpenseApiClient } from "../../api/expense-api-client/expense-api-client-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { BaseManager } from "../base-manager";
import { IUserManager } from "../user-manager/user-manager-interface";
import { IExpense } from "../../models/expense/expense-interface";
import { IExpenseMapper } from "../../mappers/expense-mapper-interface";
import { IOcrApiClient } from "../../api/ocr-api-client/ocr-api-client-interface";
import { IExpenseJoinRequestMapper } from "../../mappers/expense-join-request-mapper/expense-join-request-mapper-interface";
import { IExpenseJoinRequest } from "../../models/expense-join-request/expense-join-request-interface";

@injectable()
export class ExpenseManager extends BaseManager implements IExpenseManager {
    private readonly _api = lazyInject<IExpenseApiClient>(IExpenseApiClient);
    private readonly _ocr = lazyInject<IOcrApiClient>(IOcrApiClient);
    private readonly _userManager = lazyInject<IUserManager>(IUserManager);
    private readonly _expenseMapper = lazyInject<IExpenseMapper>(IExpenseMapper);
    private readonly _expenseJoinRequestMapper = lazyInject<IExpenseJoinRequestMapper>(IExpenseJoinRequestMapper);
    private readonly _expenses$ = new BehaviorSubject<IExpense[]>([]);
    private readonly _currentExpense$ = new BehaviorSubject<IExpense | null>(null);
    private readonly _isPendingExpenseData$ = new BehaviorSubject<boolean>(false);
    private readonly _expenseJoinRequests$ = new BehaviorSubject<IExpenseJoinRequest[]>([]);

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

    get isPendingExpenseData(): boolean {
        return this._isPendingExpenseData$.value;
    }

    get isPendingExpenseData$(): Observable<boolean> {
        return this._isPendingExpenseData$.asObservable();
    }

    get expenseJoinRequests$(): Observable<IExpenseJoinRequest[]> {
        return this._expenseJoinRequests$.asObservable();
    }

    constructor() {
        super();
    }

    protected async initialize(): Promise<void> {
        await this._userManager.initialized;
        await this._api.initialized;
        await this._ocr.initialized;

        this._userManager.user$.subscribe({
            next: (user) => this.onUserCredentialUpdated(user),
        });

        this._api.sessionExpense$.subscribe({
            next: (data) => void this.onSessionExpenseUpdated(data),
        });

        await this.requestExpenseJoinRequests();
    }

    async requestForUser(reset = true): Promise<void> {
        const expenseDtos = await this._api.getAllExpenses(reset);
        const expenses = await this._expenseMapper.toDomainBatch(expenseDtos);

        const newCollection = reset ? expenses : [...this.expenses, ...expenses];

        this._expenses$.next(newCollection.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()));
    }

    async connectToExpense(expenseId: string): Promise<void> {
        await this._api.connectToExpense(expenseId);
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

        const joinRequests: IExpenseJoinRequest[] = [];

        for (const r of requests) {
            const result = await this._expenseJoinRequestMapper.toDomain(r);
            if (result) joinRequests.push(result);
        }

        this._expenseJoinRequests$.next(joinRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }

    async removeExpenseJoinRequestForUser(expenseId: string, userId: string | undefined = undefined): Promise<void> {
        await this._api.removeExpenseJoinRequest(expenseId, userId);
        const requests = this._expenseJoinRequests$.value;
        const requestIndex = requests.findIndex((r) => r.expense.id === expenseId);
        if (requestIndex === -1) return;

        requests.splice(requestIndex, 1);
        this._expenseJoinRequests$.next(requests);
    }

    sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void> {
        return this._api.sendExpenseJoinRequest(userId, expenseId);
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

        this._expenses$.next(expenses.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()));
    }

    private async onUserCredentialUpdated(userCredential: IUserCredential | null): Promise<void> {
        if (!userCredential) {
            this._expenses$.next([]);
        }

        this._isPendingExpenseData$.next(true);
        try {
            this._api.disconnectFromExpense();
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
