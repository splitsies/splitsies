import { injectable } from "inversify";
import { IExpenseApiClient } from "./expense-api-client-interface";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { BehaviorSubject, Observable } from "rxjs";
import {
    ExpenseMessageParameters,
    ExpensePayload,
    IExpense,
    IExpenseDto,
    IExpenseItem,
    IExpenseJoinRequest,
    IExpenseJoinRequestDto,
    IExpenseMapper,
    IExpenseMessage,
    IExpenseMessageParametersMapper,
    IExpensePayload,
    IExpenseUpdateMapper,
    IExpenseUserDetails,
    IUserCredential,
} from "@splitsies/shared-models";
import { ClientBase } from "../client-base";
import { lazyInject } from "../../utils/lazy-inject";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";

@injectable()
export class ExpenseApiClient extends ClientBase implements IExpenseApiClient {
    private _connection!: WebSocket;
    private readonly _userExpenses$ = new BehaviorSubject<IExpensePayload[]>([]);
    private readonly _sessionExpense$ = new BehaviorSubject<IExpense | null>(null);
    private readonly _sessionExpenseUsers$ = new BehaviorSubject<IExpenseUserDetails[]>([]);
    private readonly _sessionExpenseJoinRequests$ = new BehaviorSubject<IExpenseJoinRequest[]>([]);
    private readonly _config = lazyInject<IApiConfig>(IApiConfig);
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);
    private readonly _expenseMapper = lazyInject<IExpenseMapper>(IExpenseMapper);
    private readonly _expenseMessageParametersMapper = lazyInject<IExpenseMessageParametersMapper>(
        IExpenseMessageParametersMapper,
    );

    constructor() {
        super();
    }

    get userExpenses$(): Observable<IExpensePayload[]> {
        return this._userExpenses$.asObservable();
    }

    get sessionExpense$(): Observable<IExpense | null> {
        return this._sessionExpense$.asObservable();
    }

    get sessionExpenseUsers$(): Observable<IExpenseUserDetails[]> {
        return this._sessionExpenseUsers$.asObservable();
    }

    get sessionExpenseJoinRequests$(): Observable<IExpenseJoinRequest[]> {
        return this._sessionExpenseJoinRequests$.asObservable();
    }

    async getAllExpenses(userCred: IUserCredential | null = null): Promise<void> {
        const userId = userCred?.user.id ?? this._authProvider.provideIdentity();
        if (!userId) {
            this._userExpenses$.next([]);
            return;
        }

        const uri = `${this._config.expense}?userId=${userId}`;
        try {
            const expenses = await this.get<IExpensePayload[]>(uri, this._authProvider.provideAuthHeader());
            this._userExpenses$.next(
                expenses.data.sort((a, b) =>
                    a.expense.transactionDate < b.expense.transactionDate
                        ? 1
                        : a.expense.transactionDate > b.expense.transactionDate
                        ? -1
                        : 0,
                ),
            );
        } catch (e) {
            return;
        }
    }

    async getExpense(expenseId: string): Promise<void> {
        const uri = `${this._config.expense}/${expenseId}`;
        try {
            const expense = await this.get<IExpenseDto>(uri, this._authProvider.provideAuthHeader());
            this._sessionExpense$.next(this._expenseMapper.toDomainModel(expense.data));
        } catch (e) {
            return;
        }
    }

    async connectToExpense(expenseId: string): Promise<void> {
        const socketUri = `${
            this._config.expenseSocket
        }?expenseId=${expenseId}&authToken=${this._authProvider.provideAuthToken()}`;
        const onConnected = new Promise<void>((res, rej) => {
            try {
                this._connection = new WebSocket(socketUri);
                this._connection.onopen = () => void this.onExpenseConnection(res, expenseId);
                this._connection.onmessage = (e) => this.onMessage(e);
            } catch (e) {
                console.error(e);
                rej(e);
            }
        });

        return onConnected;
    }

    disconnectFromExpense(): void {
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

    async addUserToExpense(userId: string, expenseId: string): Promise<void> {
        const url = `${this._config.expense}/${expenseId}/users`;

        try {
            const response = await this.postJson<void>(url, { userId }, this._authProvider.provideAuthHeader());
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

    async createExpense(base64Image: string | undefined = undefined): Promise<boolean> {
        try {
            const body = { userId: this._authProvider.provideIdentity(), image: base64Image };
            const response = await this.postJson<IExpenseDto>(
                this._config.expense,
                body,
                this._authProvider.provideAuthHeader(),
            );

            if (response.success) {
                void this.getAllExpenses();
                await this.connectToExpense(response.data.id);
                await this.getJoinRequestsForExpense(response.data.id);
            } else {
                return false;
            }

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async getExpenseJoinRequests(): Promise<IExpenseJoinRequestDto[]> {
        try {
            const url = `${this._config.expense}/requests/${this._authProvider.provideIdentity()}`;
            const response = await this.get<IExpenseJoinRequestDto[]>(url, this._authProvider.provideAuthHeader());
            return response.data;
        } catch (e) {
            return [];
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

    async getJoinRequestsForExpense(expenseId: string): Promise<IExpenseJoinRequest[]> {
        try {
            const url = `${this._config.expense}/${expenseId}/requests`;
            const response = await this.get<IExpenseJoinRequest[]>(url, this._authProvider.provideAuthHeader());

            if (this._sessionExpense$.value?.id === expenseId) {
                this._sessionExpenseJoinRequests$.next(response.data);
            }
            return response.data;
        } catch (e) {
            return [];
        }
    }

    addItem(
        expenseId: string,
        itemName: string,
        itemPrice: number,
        itemOwners: IExpenseUserDetails[],
        isItemProportional: boolean,
    ): void {
        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, itemName, itemPrice, itemOwners, isItemProportional }),
        );
        this._connection.send(JSON.stringify({ id: expenseId, method: "addItem", params }));
    }

    removeItem(expenseId: string, item: IExpenseItem): void {
        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, item }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "removeItem", params }));
    }

    updateItemSelections(expenseId: string, user: IExpenseUserDetails, selectedItemIds: string[]): void {
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
        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, item, itemName, itemPrice, isItemProportional }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateItemDetails", params }));
    }

    updateExpenseName(expenseId: string, expenseName: string): void {
        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, expenseName }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateExpenseName", params }));
    }

    updateExpenseTransactionDate(expenseId: string, transactionDate: Date): void {
        const params = this._expenseMessageParametersMapper.toDtoModel(
            new ExpenseMessageParameters({ expenseId, transactionDate }),
        );

        this._connection.send(JSON.stringify({ id: expenseId, method: "updateTransactionDate", params }));
    }

    private async onExpenseConnection(promiseResolver: () => void, expenseId: string): Promise<void> {
        await this.getExpense(expenseId);
        promiseResolver();
    }

    private async onMessage(e: WebSocketMessageEvent): Promise<void> {
        const message = JSON.parse(e.data) as IExpenseMessage;

        switch (message.type) {
            case "expense":
                this.onExpenseMessage(message.data as IExpenseDto);
                break;
            case "joinRequests":
                this.onJoinRequests(message.data as IExpenseJoinRequest[]);
                break;
            case "payload":
                this.onPayloadMessage(message.data as IExpensePayload);
                break;
        }
    }

    private onExpenseMessage(expenseDto: IExpenseDto): void {
        const expense = this._expenseMapper.toDomainModel(expenseDto);
        this._sessionExpense$.next(expense);

        const expenses = [...this._userExpenses$.value];
        const expenseIndex = expenses.findIndex((e) => e.expense.id === expense.id);
        if (expenseIndex === -1) {
            return;
        }

        expenses[expenseIndex] = new ExpensePayload(
            this._expenseMapper.toDtoModel(expense),
            expenses[expenseIndex].expenseUsers,
        );

        this._userExpenses$.next(
            expenses.sort((a, b) =>
                a.expense.transactionDate < b.expense.transactionDate
                    ? 1
                    : a.expense.transactionDate > b.expense.transactionDate
                    ? -1
                    : 0,
            ),
        );
    }

    private onJoinRequests(joinRequests: IExpenseJoinRequest[]): void {
        this._sessionExpenseJoinRequests$.next(joinRequests);
    }

    private onPayloadMessage(expensePayload: IExpensePayload): void {
        const updatedExpenseDto = expensePayload.expense;
        const expense = this._expenseMapper.toDomainModel(updatedExpenseDto);

        this._sessionExpense$.next(expense);
        this._sessionExpenseUsers$.next(expensePayload.expenseUsers);

        const expenses = [...this._userExpenses$.value];
        const expenseIndex = expenses.findIndex((e) => e.expense.id === expense.id);
        if (expenseIndex === -1) {
            return;
        }

        expenses[expenseIndex] = expensePayload;

        this._userExpenses$.next(
            expenses.sort((a, b) =>
                a.expense.transactionDate < b.expense.transactionDate
                    ? 1
                    : a.expense.transactionDate > b.expense.transactionDate
                    ? -1
                    : 0,
            ),
        );
    }
}
