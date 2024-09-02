import {
    ExpenseMessage,
    ExpenseMessageParameters,
    ExpenseMessageType,
    IExpenseDto,
    IExpenseItem,
    IExpenseMessageParametersMapper,
    IExpenseUserDetails,
} from "@splitsies/shared-models";
import { injectable } from "inversify";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpenseMessageStrategy } from "../../strategies/expense-message-strategy/expense-message-strategy.i";
import { lazyInject } from "../../utils/lazy-inject";
import { ClientBase } from "../client-base";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";
import { IRequestConfiguration } from "../../models/configuration/request-config/request-configuration-interface";
import { IExpenseSocketClient } from "./expense-socket-client.i";

@injectable()
export class ExpenseSocketClient extends ClientBase implements IExpenseSocketClient {
    private readonly _sessionExpense$ = new BehaviorSubject<IExpenseDto | null>(null);
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);
    private readonly _messageStrategy = lazyInject<IExpenseMessageStrategy>(IExpenseMessageStrategy);
    private readonly _paramMapper = lazyInject<IExpenseMessageParametersMapper>(IExpenseMessageParametersMapper);
    private readonly _connectionConfig = lazyInject<IRequestConfiguration>(IRequestConfiguration);
    private _connection!: WebSocket;
    private _connected: Promise<boolean> = Promise.resolve(false);
    private _connectedExpenseId: string | null = null;

    private _allowedExpenseConnection = "";

    get sessionExpense$(): Observable<IExpenseDto | null> {
        return this._sessionExpense$.asObservable();
    }

    get connected(): Promise<boolean> {
        return this._connected;
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

    async connectToExpense(expenseId: string): Promise<boolean> {
        try {
            this._connectedExpenseId = expenseId;
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

            this._connected = new Promise<boolean>((res, rej) => {
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
        this._connected = Promise.resolve(false);
        if (!this._connection || this._connection.readyState >= 2) {
            this._sessionExpense$.next(null);
            return;
        }

        this._connection.close();
        this._sessionExpense$.next(null);
    }

    addItem(
        expenseId: string,
        itemName: string,
        itemPrice: number,
        itemOwners: IExpenseUserDetails[],
        isItemProportional: boolean,
    ): void {
        if (
            this.queueIfPendingConnection(this._connectedExpenseId!, () =>
                this.addItem(expenseId, itemName, itemPrice, itemOwners, isItemProportional),
            )
        ) {
            return;
        }

        const params = this._paramMapper.toDtoModel({ expenseId, itemName, itemPrice, itemOwners, isItemProportional });
        this._connection.send(JSON.stringify({ id: expenseId, method: "addItem", params }));
    }

    removeItem(expenseId: string, item: IExpenseItem): void {
        if (this.queueIfPendingConnection(this._connectedExpenseId!, () => this.removeItem(expenseId, item))) {
            return;
        }

        const params = this._paramMapper.toDtoModel({ expenseId, item });

        this._connection.send(JSON.stringify({ id: expenseId, method: "removeItem", params }));
    }

    updateItemSelections(expenseId: string, user: IExpenseUserDetails, selectedItemIds: string[]): void {
        if (
            this.queueIfPendingConnection(this._connectedExpenseId!, () =>
                this.updateItemSelections(expenseId, user, selectedItemIds),
            )
        ) {
            return;
        }

        const params = this._paramMapper.toDtoModel({ expenseId, user, selectedItemIds });

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
            this.queueIfPendingConnection(this._connectedExpenseId!, () =>
                this.updateItemDetails(expenseId, item, itemName, itemPrice, isItemProportional),
            )
        ) {
            return;
        }

        const params = this._paramMapper.toDtoModel({ expenseId, item, itemName, itemPrice, isItemProportional });

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateItemDetails", params }));
    }

    updateExpenseName(expenseId: string, expenseName: string): void {
        if (
            this.queueIfPendingConnection(this._connectedExpenseId!, () =>
                this.updateExpenseName(expenseId, expenseName),
            )
        ) {
            return;
        }

        const params = this._paramMapper.toDtoModel({ expenseId, expenseName });

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateExpenseName", params }));
    }

    updateExpenseTransactionDate(expenseId: string, transactionDate: Date): void {
        if (
            this.queueIfPendingConnection(this._connectedExpenseId!, () =>
                this.updateExpenseTransactionDate(expenseId, transactionDate),
            )
        ) {
            return;
        }

        const params = this._paramMapper.toDtoModel({ expenseId, transactionDate });

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateTransactionDate", params }));
    }

    updateSingleItemSelected(
        expenseId: string,
        user: IExpenseUserDetails,
        item: IExpenseItem,
        itemSelected: boolean,
    ): void {
        if (
            this.queueIfPendingConnection(this._connectedExpenseId!, () =>
                this.updateSingleItemSelected(expenseId, user, item, itemSelected),
            )
        ) {
            return;
        }

        const params = this._paramMapper.toDtoModel({ expenseId, item, itemSelected, user, ignoreResponse: true });

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateSingleItemSelected", params }));
    }

    updateSessionExpense(expenseDto: IExpenseDto | null): void {
        this._sessionExpense$.next(expenseDto);
    }

    async ensureConnection(): Promise<void> {
        if (await this._connected) return;

        if (this._connection?.readyState === 0) {
            await this._connected;
        } else if (this._connection?.readyState >= 2) {
            await this.connectToExpense(this._connectedExpenseId!);
        }
    }

    private async onExpenseConnection(promiseResolver: (value: boolean) => void, expenseId: string): Promise<void> {
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
            await this.getExpense(this._connectedExpenseId!);
            promiseResolver(true);
        } catch (e) {
            console.warn("Error sending initial ping event", e);
            promiseResolver(false);
        }
    }

    private async onMessage(e: WebSocketMessageEvent): Promise<void> {
        const message = JSON.parse(e.data) as ExpenseMessage;

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

        if (!this._sessionExpense$.value) {
            if (message.type === ExpenseMessageType.ExpenseDto) {
                this._sessionExpense$.next(message.expenseDto ? message.expenseDto : null);
                return;
            }

            console.warn("Received an expense message without a session");
            return;
        }

        const updatedExpense = await this._messageStrategy.process(message, this._sessionExpense$.value);
        this._sessionExpense$.next(updatedExpense);
    }

    private queueIfPendingConnection(expenseId: string, action: () => void): boolean {
        if (!this._connection || this._connection.readyState >= 2) {
            // requires reconnection
            this.connectToExpense(expenseId).then(() => {
                action();
            });

            return true;
        }

        if (this._connection.readyState === 0) {
            this.waitForConnection().then(() => {
                action();
            });
            return true;
        }

        return false;
    }

    private async waitForConnectionClose(): Promise<void> {
        const retryLimit =
            this._connectionConfig.connectionTimeoutMs / this._connectionConfig.connectionCheckIntervalMs;

        for (let retries = 0; retries < retryLimit && this._connection.readyState !== 3; retries++) {
            await new Promise<void>((res) => setTimeout(() => res(), this._connectionConfig.connectionCheckIntervalMs));
        }
    }

    private async waitForConnection(): Promise<void> {
        if (this._connection?.readyState === 1) return Promise.resolve();

        const retryLimit =
            this._connectionConfig.connectionTimeoutMs / this._connectionConfig.connectionCheckIntervalMs;
        for (let retries = 0; retries < retryLimit && this._connection.readyState < 1; retries++) {
            await new Promise<void>((res) => setTimeout(() => res(), this._connectionConfig.connectionCheckIntervalMs));
        }
    }
}
