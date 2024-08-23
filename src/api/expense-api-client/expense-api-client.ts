import { injectable } from "inversify";
import { IExpenseApiClient } from "./expense-api-client-interface";
import { BehaviorSubject, Observable, queue } from "rxjs";
import {
    ExpenseMessage,
    ExpenseMessageParameters,
    IExpenseDto,
    IExpenseItem,
    IExpenseMessageParametersMapper,
    IExpensePayerDto,
    IExpenseUserDetails,
    IScanResult,
} from "@splitsies/shared-models";
import { ClientBase } from "../client-base";
import { lazyInject } from "../../utils/lazy-inject";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";
import { IUserExpenseDto } from "../../models/user-expense-dto/user-expense-dto-interface";
import { IExpenseMessageStrategy } from "../../strategies/expense-message-strategy/expense-message-strategy.i";

@injectable()
export class ExpenseApiClient extends ClientBase implements IExpenseApiClient {
    private _connection!: WebSocket;
    private readonly _sessionExpense$ = new BehaviorSubject<IExpenseDto | null>(null);
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);
    private readonly _messageStrategy = lazyInject<IExpenseMessageStrategy>(IExpenseMessageStrategy);
    private readonly _expenseMessageParametersMapper = lazyInject<IExpenseMessageParametersMapper>(
        IExpenseMessageParametersMapper,
    );

    private _allowedExpenseConnection = "";
    private _connected: Promise<void>;

    constructor() {
        super();
    }

    get sessionExpense$(): Observable<IExpenseDto | null> {
        return this._sessionExpense$.asObservable();
    }

    async getAllExpenses(reset = true): Promise<IExpenseDto[]> {
        try {
            const pageKey = "getAllExpenses";
            const userId = this._authProvider.provideIdentity();
            if (!userId) {
                return [];
            }

            if (reset && this._scanPageKeys.has(pageKey)) {
                this._scanPageKeys.delete(pageKey);
            }

            const pagination = this._scanPageKeys.get(pageKey)?.nextPage ?? { limit: 7, offset: 0 };
            let uri = `${this._config.expense}?userId=${userId}`;
            uri += `&pagination=${encodeURIComponent(JSON.stringify(pagination))}`;
            const expenses = await this.get<IScanResult<IExpenseDto>>(uri, this._authProvider.provideAuthHeader());
            this._scanPageKeys.set(pageKey, expenses.data.lastEvaluatedKey);
            return expenses?.data.result ?? [];
        } catch (e) {
            return [];
        }
    }

    async getExpense(expenseId: string): Promise<void> {
        const uri = `${this._config.expense}/${expenseId}`;
        try {
            const expense = await this.get<IExpenseDto>(uri, this._authProvider.provideAuthHeader());
            this._sessionExpense$.next(expense.data);
        } catch (e) {
            return;
        }
    }

    async connectToExpense(expenseId: string): Promise<void> {
        try {
            this._allowedExpenseConnection = expenseId;

            if (this._connection?.readyState !== 1) {
                try {
                    this._connection.close();
                    await this.waitForConnectionClose();
                } catch {
                    // ignore
                }
            }

            const tokenResponse = await this.postJson<string>(
                `${this._config.expense}/${expenseId}/connections/tokens`,
                {},
                this._authProvider.provideAuthHeader(),
            );
            const socketUri = `${
                this._config.expenseSocket
            }?expenseId=${expenseId}&userId=${this._authProvider.provideIdentity()}&connectionToken=${
                tokenResponse.data
            }`;
            this._connected = new Promise<void>((res, rej) => {
                try {
                    this._connection = new WebSocket(socketUri);
                    this._connection.onopen = () => void this.onExpenseConnection(res, expenseId);
                    this._connection.onmessage = (e) => this.onMessage(e);
                    this._connection.onclose = () => this.disconnectFromExpense();
                } catch (e) {
                    console.error(e);
                    rej(e);
                }
            });

            return this._connected;
        } catch (e) {
            console.warn("Error on connection attempt", e);
            return Promise.reject();
        }
    }

    async pingConnection(): Promise<void> {
        const socketUri = `${this._config.expenseSocket}?ping=true`;

        const onConnected = new Promise<void>((res, rej) => {
            try {
                const conn = new WebSocket(socketUri);
                conn.onopen = () => {
                    res();
                };
            } catch (e) {
                console.error(e);
                rej(e);
            }
        });

        return onConnected;
    }

    disconnectFromExpense(): void {
        this._allowedExpenseConnection = "";
        if (!this._connection || this._connection.readyState >= 2) {
            this._sessionExpense$.next(null);
            return;
        }

        this._connection.close();
        this._sessionExpense$.next(null);
    }

    async getUserIdsForExpense(expenseId: string): Promise<string[]> {
        const url = `${this._config.expense}/${expenseId}/users`;

        try {
            const response = await this.get<string[]>(url, this._authProvider.provideAuthHeader());
            return response.data;
        } catch (e) {
            return [];
        }
    }

    async addUserToExpense(
        userId: string,
        expenseId: string,
        requestingUserId: string | undefined = undefined,
    ): Promise<void> {
        const url = `${this._config.expense}/${expenseId}/users`;

        try {
            const response = await this.postJson<void>(
                url,
                { userId, requestingUserId },
                this._authProvider.provideAuthHeader(),
            );
            if (!response.success) throw new Error(`${response.data}`);
        } catch (e) {
            console.error(e);
        }
    }

    async removeUserFromExpense(userId: string, expenseId: string): Promise<void> {
        const url = `${this._config.expense}/${expenseId}/users/${userId}`;

        try {
            await this.delete(url, this._authProvider.provideAuthHeader());
        } catch (e) {
            console.error(e);
        }
    }

    async createFromExpense(expenseDto: IExpenseDto): Promise<boolean> {
        try {
            const body = { userId: this._authProvider.provideIdentity(), expense: expenseDto };

            const response = await this.postJson<IExpenseDto>(
                this._config.expense,
                body,
                this._authProvider.provideAuthHeader(),
            );

            if (response.success) {
                await this.connectToExpense(response.data.id);
            } else {
                return false;
            }

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async createExpense(base64Image: string | undefined = undefined): Promise<boolean> {
        try {
            const body = { userId: this._authProvider.provideIdentity() };
            const response = await this.postJson<IExpenseDto>(
                this._config.expense,
                body,
                this._authProvider.provideAuthHeader(),
            );

            if (response.success) {
                await this.connectToExpense(response.data.id);
            } else {
                return false;
            }

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async getExpenseJoinRequests(reset = true): Promise<IUserExpenseDto[]> {
        try {
            const pageKey = "getExpenseJoinRequests";
            const userId = this._authProvider.provideIdentity();
            if (!userId) {
                return [];
            }

            if (reset && this._scanPageKeys.has(pageKey)) {
                this._scanPageKeys.delete(pageKey);
            }

            const pagination = this._scanPageKeys.get(pageKey)?.nextPage ?? { limit: 10, offset: 0 };
            let url = `${this._config.expense}/requests/${this._authProvider.provideIdentity()}`;
            url += `?pagination=${encodeURIComponent(JSON.stringify(pagination))}`;

            const response = await this.get<IScanResult<IUserExpenseDto>>(url, this._authProvider.provideAuthHeader());
            this._scanPageKeys.set(pageKey, response.data.lastEvaluatedKey);
            return response?.data.result ?? [];
        } catch (e) {
            return [];
        }
    }

    async getExpenseJoinRequestCount(): Promise<number> {
        try {
            const url = `${this._config.expense}/requests/${this._authProvider.provideIdentity()}/count`;
            const response = await this.get<string>(url, this._authProvider.provideAuthHeader());
            return parseInt(response.data);
        } catch (e) {
            return 0;
        }
    }

    async removeExpenseJoinRequest(expenseId: string, userId: string | undefined = undefined): Promise<void> {
        try {
            const url = `${this._config.expense}/${expenseId}/requests/${
                userId ?? this._authProvider.provideIdentity()
            }`;
            await this.delete(url, this._authProvider.provideAuthHeader());
        } catch {
            return;
        }
    }

    async sendExpenseJoinRequest(userId: string, expenseId: string): Promise<void> {
        try {
            const url = `${this._config.expense}/requests`;
            const response = await this.postJson<void>(
                url,
                {
                    userId,
                    expenseId,
                    requestingUserId: this._authProvider.provideIdentity(),
                },
                this._authProvider.provideAuthHeader(),
            );
        } catch (e) {
            return;
        }
    }

    async requestSetExpensePayers(expensePayerDto: IExpensePayerDto): Promise<void> {
        try {
            const url = `${this._config.expense}/${expensePayerDto.expenseId}/payers`;
            await this.putJson<IExpenseDto>(
                url,
                {
                    payerShares: expensePayerDto.payers,
                },
                this._authProvider.provideAuthHeader(),
            );
        } catch (e) {
            return;
        }
    }

    async requestSetExpensePayerStatus(expenseId: string, userId: string, settled: boolean): Promise<void> {
        try {
            const url = `${this._config.expense}/${expenseId}/payers/${userId}`;
            await this.putJson<IExpenseDto>(url, { settled }, this._authProvider.provideAuthHeader());
        } catch (e) {
            return;
        }
    }

    async requestAddToExpenseGroup(expenseId: string, expense: IExpenseDto | undefined): Promise<void> {
        try {
            const url = `${this._config.expense}/${expenseId}/children`;
            await this.postJson<IExpenseDto>(url, { expense }, this._authProvider.provideAuthHeader());
        } catch (e) {
            return;
        }
    }

    async addExistingExpenseToGroup(groupExpenseId: string, childExpenseId: string): Promise<void> {
        try {
            const url = `${this._config.expense}/${groupExpenseId}/children`;
            await this.putJson<void>(url, { childExpenseId }, this._authProvider.provideAuthHeader());
        } catch (e) {
            return;
        }
    }

    async removeExpenseFromGroup(groupExpenseId: string, childExpenseId: string): Promise<void> {
        try {
            const url = `${this._config.expense}/${groupExpenseId}/children/${childExpenseId}`;
            await this.delete(url, this._authProvider.provideAuthHeader());
        } catch (e) {
            return;
        }
    }

    addItem(
        expenseId: string,
        itemName: string,
        itemPrice: number,
        itemOwners: IExpenseUserDetails[],
        isItemProportional: boolean,
    ): void {
        if (
            this.queueIfPendingConnection(expenseId, () =>
                this.addItem(expenseId, itemName, itemPrice, itemOwners, isItemProportional),
            )
        ) {
            return;
        }

        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, itemName, itemPrice, itemOwners, isItemProportional }),
        );
        this._connection.send(JSON.stringify({ id: expenseId, method: "addItem", params }));
    }

    removeItem(expenseId: string, item: IExpenseItem): void {
        if (this.queueIfPendingConnection(expenseId, () => this.removeItem(expenseId, item))) {
            return;
        }

        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, item }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "removeItem", params }));
    }

    updateItemSelections(expenseId: string, user: IExpenseUserDetails, selectedItemIds: string[]): void {
        if (
            this.queueIfPendingConnection(expenseId, () => this.updateItemSelections(expenseId, user, selectedItemIds))
        ) {
            return;
        }

        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, user, selectedItemIds }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateItemSelections", params }));
    }

    updateItemDetails(
        expenseId: string,
        item: IExpenseItem,
        itemName: string,
        itemPrice: number,
        isItemProportional: boolean,
    ): void {
        if (
            this.queueIfPendingConnection(expenseId, () =>
                this.updateItemDetails(expenseId, item, itemName, itemPrice, isItemProportional),
            )
        ) {
            return;
        }

        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, item, itemName, itemPrice, isItemProportional }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateItemDetails", params }));
    }

    updateExpenseName(expenseId: string, expenseName: string): void {
        if (this.queueIfPendingConnection(expenseId, () => this.updateExpenseName(expenseId, expenseName))) {
            return;
        }

        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, expenseName }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateExpenseName", params }));
    }

    updateExpenseTransactionDate(expenseId: string, transactionDate: Date): void {
        if (
            this.queueIfPendingConnection(expenseId, () =>
                this.updateExpenseTransactionDate(expenseId, transactionDate),
            )
        ) {
            return;
        }

        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, transactionDate }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateTransactionDate", params }));
    }

    updateSingleItemSelected(
        expenseId: string,
        user: IExpenseUserDetails,
        item: IExpenseItem,
        itemSelected: boolean,
    ): void {
        if (
            this.queueIfPendingConnection(expenseId, () =>
                this.updateSingleItemSelected(expenseId, user, item, itemSelected),
            )
        ) {
            return;
        }

        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, item, itemSelected, user, ignoreResponse: true }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateSingleItemSelected", params }));
    }

    updateSessionExpense(expenseDto: IExpenseDto | null): void {
        this._sessionExpense$.next(expenseDto);
    }

    private async onExpenseConnection(promiseResolver: () => void, expenseId: string): Promise<void> {
        if (
            !this._allowedExpenseConnection ||
            this._allowedExpenseConnection !== expenseId ||
            this._connection?.readyState !== 1
        ) {
            console.warn("Established connection after termination");
            // On rapid connect/disconnect, ensure that we don't create a background connection when
            // the connection gets through after we've decided we no longer want to be connected
            try {
                this._connection?.close();
                await this.waitForConnectionClose();
            } catch {}
            return;
        }

        // Ping the message endpoint to warm up an execution environment
        try {
            this._connection.send(
                JSON.stringify({
                    id: expenseId,
                    method: "ping",
                    params: new ExpenseMessageParameters({ expenseId }),
                }),
            );
        } catch (e) {
            console.warn("Error sending initial ping event", e);
        } finally {
            promiseResolver();
        }
    }

    private async onMessage(e: WebSocketMessageEvent): Promise<void> {
        const message = JSON.parse(e.data) as ExpenseMessage;

        if (message.type === undefined || !this._sessionExpense$.value) {
            console.warn(this._sessionExpense$.value);
            return;
        }

        if (this._allowedExpenseConnection !== message.connectedExpenseId) {
            console.warn("Established connection after termination");
            // On rapid connect/disconnect, ensure that we don't create a background connection when
            // the connection gets through after we've decided we no longer want to be connected
            if (message.connectedExpenseId) {
                try {
                    this._connection?.close();
                    await this.waitForConnectionClose();
                } catch {}
            }
            return;
        }

        const updatedExpense = await this._messageStrategy.process(message, this._sessionExpense$.value);
        this._sessionExpense$.next(updatedExpense);
    }

    private queueIfPendingConnection(expenseId: string, action: () => void): boolean {
        if (!this._connection || this._connection.readyState >= 2) {
            // requires reconnection
            this.connectToExpense(expenseId).then(() => action());
            return true;
        }

        if (this._connection.readyState === 0) {
            this.waitForConnection().then(() => action());
            return true;
        }

        return false;
    }

    private async waitForConnectionClose(): Promise<void> {
        for (let retries = 0; retries < 20 && this._connection.readyState !== 3; retries++) {
            await new Promise<void>((res) => setTimeout(() => res(), 100));
        }
    }

    private async waitForConnection(): Promise<void> {
        if (this._connection?.readyState === 1) return Promise.resolve();

        for (let retries = 0; retries < 20 && this._connection.readyState < 1; retries++) {
            await new Promise<void>((res) => setTimeout(() => res(), 100));
        }
    }
}
