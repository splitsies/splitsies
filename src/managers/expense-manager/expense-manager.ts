import { injectable } from "inversify";
import { IExpenseManager } from "./expense-manager-interface";
import {
    ExpensePayerDto,
    IExpenseDto,
    IExpenseItem,
    IExpenseUserDetails,
    IUserCredential,
    PayerShare,
} from "@splitsies/shared-models";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpenseApiClient } from "../../api/expense-api-client/expense-api-client.i";
import { lazyInject } from "../../utils/lazy-inject";
import { BaseManager } from "../base-manager";
import { IUserManager } from "../user-manager/user-manager-interface";
import { IExpense } from "../../models/expense/expense-interface";
import { IExpenseMapper } from "../../mappers/expense-mapper-interface";
import { IOcrApiClient } from "../../api/ocr-api-client/ocr-api-client-interface";
import { IExpenseJoinRequestMapper } from "../../mappers/expense-join-request-mapper/expense-join-request-mapper-interface";
import { IExpenseJoinRequest } from "../../models/expense-join-request/expense-join-request-interface";
import { IExpenseSocketClient } from "../../api/expense-socket-client/expense-socket-client.i";

@injectable()
export class ExpenseManager extends BaseManager implements IExpenseManager {
    private readonly _api = lazyInject<IExpenseApiClient>(IExpenseApiClient);
    private readonly _socket = lazyInject<IExpenseSocketClient>(IExpenseSocketClient);
    private readonly _ocr = lazyInject<IOcrApiClient>(IOcrApiClient);
    private readonly _userManager = lazyInject<IUserManager>(IUserManager);
    private readonly _expenseMapper = lazyInject<IExpenseMapper>(IExpenseMapper);
    private readonly _expenseJoinRequestMapper = lazyInject<IExpenseJoinRequestMapper>(IExpenseJoinRequestMapper);
    private readonly _expenses$ = new BehaviorSubject<IExpense[]>([]);
    private readonly _currentExpense$ = new BehaviorSubject<IExpense | null>(null);
    private readonly _isPendingExpenseData$ = new BehaviorSubject<boolean>(false);
    private readonly _expenseJoinRequests$ = new BehaviorSubject<IExpenseJoinRequest[]>([]);
    private readonly _expenseJoinRequestCount$ = new BehaviorSubject<number>(0);

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

    get expenseJoinRequestCount$(): Observable<number> {
        return this._expenseJoinRequestCount$.asObservable();
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

        this._socket.sessionExpense$.subscribe({
            next: (data) => void this.onSessionExpenseUpdated(data),
        });

        await this.requestExpenseJoinRequests();
    }

    async requestForUser(reset = true): Promise<void> {
        const ids = new Set<string>(this.expenses.map((e) => e.id));
        const expenseDtos = await this._api.getAllExpenses(reset);
        const expenses = await this._expenseMapper.toDomainBatch(expenseDtos);

        const newCollection = reset ? expenses : [...this.expenses, ...expenses.filter((e) => !ids.has(e.id))];

        this._expenses$.next(newCollection.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()));
    }

    async refreshCurrentExpense(): Promise<void> {
        if (!this.currentExpense) {
            console.warn("Attempted to refresh current expense while null");
            return Promise.resolve();
        }

        return await this._socket.getExpense(this.currentExpense.id);
    }

    async connectToExpense(expenseId: string): Promise<boolean> {
        try {
            const expense = this.expenses.find((e) => e.id === expenseId);

            if (!expense) {
                await this._socket.getExpense(expenseId);
                void this.requestForUser();
                return this._socket.connectToExpense(expenseId);
            }

            void this._socket.getExpense(expenseId);

            this._socket.updateSessionExpense(this._expenseMapper.toDto(expense));
            return this._socket.connectToExpense(expenseId);
        } catch {
            this._socket.updateSessionExpense(null);
            return false;
        }
    }

    requestAddUserToExpense(
        userId: string,
        expenseId: string,
        requestingUserId: string | undefined = undefined,
    ): Promise<void> {
        return this._api.addUserToExpense(userId, expenseId, requestingUserId);
    }

    async requestRemoveUserFromExpense(userId: string, expenseId: string): Promise<void> {
        await this._api.removeUserFromExpense(userId, expenseId);
    }

    disconnectFromExpense(): void {
        this._socket.disconnectFromExpense();
        this._currentExpense$.next(null);
    }

    async createExpense(base64Image?: string): Promise<boolean> {
        if (this.currentExpense && !base64Image) {
            await this._api.requestAddToExpenseGroup(this.currentExpense.id);
            return true;
        }

        if (base64Image) {
            const expense = await this._ocr.scanImage(base64Image);
            if (!expense) return false;

            if (this.currentExpense) {
                await this._api.requestAddToExpenseGroup(this.currentExpense.id, expense);
                await this.refreshCurrentExpense();
                return true;
            }

            const id = await this._api.createFromExpense(expense);
            if (!id) return false;

            await this._socket.getExpense(id);
            await this._socket.connectToExpense(id);
            return true;
        }

        const id = await this._api.createExpense(base64Image);
        if (!id) return false;

        await this._socket.getExpense(id);
        await this._socket.connectToExpense(id);
        return true;
    }

    async requestExpenseJoinRequests(reset = true): Promise<void> {
        if (reset) {
            await this.getExpenseJoinRequestCount();
        }

        const requests = await this._api.getExpenseJoinRequests(reset);
        const joinRequests: IExpenseJoinRequest[] = [];

        for (const r of requests) {
            const result = await this._expenseJoinRequestMapper.toDomain(r);
            if (result) joinRequests.push(result);
        }

        const newCollection = reset ? joinRequests : [...this._expenseJoinRequests$.value, ...joinRequests];
        this._expenseJoinRequests$.next(newCollection.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }

    async getExpenseJoinRequestCount(): Promise<void> {
        const count = await this._api.getExpenseJoinRequestCount();
        this._expenseJoinRequestCount$.next(count);
    }

    async removeExpenseJoinRequestForUser(expenseId: string, userId: string | undefined = undefined): Promise<void> {
        await this._api.removeExpenseJoinRequest(expenseId, userId);
        const requests = this._expenseJoinRequests$.value;
        const requestIndex = requests.findIndex((r) => r.expense.id === expenseId);
        if (requestIndex === -1) return;

        requests.splice(requestIndex, 1);
        this._expenseJoinRequests$.next(requests);
    }

    // TODO: This method signture ensures only one payer per expense, but the backing
    // design allows multiple. At some point, UX should be defined for multiple payer workflows
    async requestSetExpensePayers(expenseId: string, userId: string): Promise<void> {
        const expensePayerDto = new ExpensePayerDto(expenseId, [new PayerShare(userId, 1)]);
        await this._api.requestSetExpensePayers(expensePayerDto);
    }

    async requestSetExpensePayerStatus(expenseId: string, userId: string, settled: boolean): Promise<void> {
        await this._api.requestSetExpensePayerStatus(expenseId, userId, settled);
    }

    async addExistingExpenseToGroup(groupExpenseId: string, childExpenseId: string): Promise<void> {
        await this._api.addExistingExpenseToGroup(groupExpenseId, childExpenseId);
        await this.requestForUser();
    }

    async removeExpenseFromGroup(groupExpenseId: string, childExpenseId: string): Promise<void> {
        await this._api.removeExpenseFromGroup(groupExpenseId, childExpenseId);
        await this.requestForUser();
    }

    async deleteExpense(expenseId: string): Promise<void> {
        await this._api.deleteExpense(expenseId);

        if (this.currentExpense) {
            const index = this.currentExpense.children.findIndex((c) => c.id === expenseId);
            if (index === -1) return;

            this.currentExpense.children.splice(index, 1);
            this._socket.updateSessionExpense(this._expenseMapper.toDto(this.currentExpense));
        }

        this._expenses$.next(this.expenses.filter((e) => e.id !== expenseId));
    }

    scanPreflight(): Promise<void> {
        return this._ocr.preflight();
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
        this._socket.addItem(expenseId, itemName, itemPrice, itemOwners, isItemProportional);
    }

    removeItem(expenseId: string, item: IExpenseItem): void {
        this._socket.removeItem(expenseId, item);
    }

    updateItemSelections(expenseId: string, user: IExpenseUserDetails, selectedItemIds: string[]): void {
        this._socket.updateItemSelections(expenseId, user, selectedItemIds);
    }

    updateItemDetails(
        expenseId: string,
        item: IExpenseItem,
        itemName: string,
        itemPrice: number,
        isItemProportional: boolean,
    ): void {
        this._socket.updateItemDetails(expenseId, item, itemName, itemPrice, isItemProportional);
    }

    updateExpenseName(expenseId: string, expenseName: string): void {
        this._socket.updateExpenseName(expenseId, expenseName);
    }

    updateExpenseTransactionDate(expenseId: string, transactionDate: Date): void {
        this._socket.updateExpenseTransactionDate(expenseId, transactionDate);
    }

    updateSingleItemSelected(
        expenseId: string,
        user: IExpenseUserDetails,
        item: IExpenseItem,
        itemSelected: boolean,
    ): void {
        this._socket.updateSingleItemSelected(expenseId, user, item, itemSelected);
    }

    /**
     * @deprecated
     * To be used sparingly, only to avoid latency in a server response to
     * update the current expense
     * @param expense
     */
    updateCurrentExpense(expense: IExpense): void {
        this._socket.updateSessionExpense(this._expenseMapper.toDto(expense));
    }

    private async onSessionExpenseUpdated(expenseDto: IExpenseDto | null): Promise<void> {
        if (expenseDto == null) {
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
        } else {
            void this._socket.pingConnection();
        }

        this._isPendingExpenseData$.next(true);
        try {
            this._socket.disconnectFromExpense();
        } finally {
            this._isPendingExpenseData$.next(false);
        }
    }
}
