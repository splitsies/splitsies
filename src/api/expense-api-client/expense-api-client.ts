import { injectable } from "inversify";
import { IExpenseApiClient } from "./expense-api-client-interface";
import { BehaviorSubject, Observable } from "rxjs";
import {
    ExpenseMessageParameters,
    IExpenseDto,
    IExpenseItem,
    IExpenseMessageParametersMapper,
    IExpenseUserDetails,
    IScanResult,
} from "@splitsies/shared-models";
import { ClientBase } from "../client-base";
import { lazyInject } from "../../utils/lazy-inject";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";
import { IUserExpenseDto } from "../../models/user-expense-dto/user-expense-dto-interface";

@injectable()
export class ExpenseApiClient extends ClientBase implements IExpenseApiClient {
    private _connection!: WebSocket;
    private readonly _sessionExpense$ = new BehaviorSubject<IExpenseDto | null>(null);
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);
    private readonly _expenseMessageParametersMapper = lazyInject<IExpenseMessageParametersMapper>(
        IExpenseMessageParametersMapper,
    );

    constructor() {
        super();
    }

    get sessionExpense$(): Observable<IExpenseDto | null> {
        return this._sessionExpense$.asObservable();
    }

    async getAllExpenses(reset = true): Promise<IExpenseDto[]> {
        
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

        try {
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
        
        const tokenResponse = await this.postJson<string>(
            `${this._config.expense}/${expenseId}/connections/tokens`,
            {},
            this._authProvider.provideAuthHeader(),
        );
        const socketUri = `${
            this._config.expenseSocket
        }?expenseId=${expenseId}&userId=${this._authProvider.provideIdentity()}&connectionToken=${tokenResponse.data}`;
        const onConnected = new Promise<void>((res, rej) => {
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

    async createFromExpense(expenseDto: IExpenseDto): Promise<boolean> {
        
        try {
            console.log({ expenseDto });
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

    async getExpenseJoinRequests(): Promise<IUserExpenseDto[]> {
        
        try {
            const url = `${this._config.expense}/requests/${this._authProvider.provideIdentity()}`;
            const response = await this.get<IUserExpenseDto[]>(url, this._authProvider.provideAuthHeader());
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
        
        const message = JSON.parse(e.data) as IExpenseDto;
        this._sessionExpense$.next(message);
    }
}
