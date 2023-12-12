import { injectable } from "inversify";
import { IExpenseApiClient } from "./expense-api-client-interface";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { BehaviorSubject, Observable } from "rxjs";
import {
    ExpensePayload,
    IExpense,
    IExpenseDto,
    IExpenseMapper,
    IExpensePayload,
    IExpenseUpdateMapper,
} from "@splitsies/shared-models";
import { ClientBase } from "../client-base";
import { lazyInject } from "../../utils/lazy-inject";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";

@injectable()
export class ExpenseApiClient extends ClientBase implements IExpenseApiClient {
    private _connection!: WebSocket;
    private readonly _userExpenses$ = new BehaviorSubject<IExpensePayload[]>([]);
    private readonly _sessionExpense$ = new BehaviorSubject<IExpense | null>(null);
    private readonly _config = lazyInject<IApiConfig>(IApiConfig);
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);
    private readonly _expenseMappper = lazyInject<IExpenseMapper>(IExpenseMapper);
    private readonly _expenseUpdateMapper = lazyInject<IExpenseUpdateMapper>(IExpenseUpdateMapper);

    constructor() {
        super();
    }

    get userExpenses$(): Observable<IExpensePayload[]> {
        return this._userExpenses$.asObservable();
    }

    get sessionExpense$(): Observable<IExpense | null> {
        return this._sessionExpense$.asObservable();
    }

    async getAllExpenses(userId: string): Promise<void> {
        if (!userId) {
            this._userExpenses$.next([]);
            return;
        }

        const uri = `${this._config.expense}?userId=${userId}`;
        try {
            const expenses = await this.get<IExpensePayload[]>(uri, this._authProvider.provideAuthHeader());
            this._userExpenses$.next(expenses.data);
        } catch (e) {
            console.error(e);
        }
    }

    async getExpense(expenseId: string): Promise<void> {
        const uri = `${this._config.expense}/${expenseId}`;
        try {
            const expense = await this.get<IExpenseDto>(uri, this._authProvider.provideAuthHeader());
            this._sessionExpense$.next(this._expenseMappper.toDomainModel(expense.data));
        } catch (e) {
            console.error(e);
        }
    }

    async updateExpense(expense: IExpense): Promise<void> {
        const { id } = expense;
        const update = this._expenseUpdateMapper.toDtoModel(expense);

        this._connection.send(
            JSON.stringify({
                id,
                method: "update",
                expense: update,
            }),
        );
    }

    async addItemToExpense(
        id: string,
        name: string,
        price: number,
        owners: string[],
        isProportional: boolean,
    ): Promise<void> {
        const item = { name, price, owners, isProportional };

        const payload = JSON.stringify({
            id,
            method: "addItem",
            item,
        });

        this._connection.send(payload);
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
            console.error(e);
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
                void this.getAllExpenses(this._authProvider.provideIdentity());
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

    private async onExpenseConnection(promiseResolver: () => void, expenseId: string): Promise<void> {
        await this.getExpense(expenseId);
        promiseResolver();
    }

    private async onMessage(e: WebSocketMessageEvent): Promise<void> {
        const updatedExpense = JSON.parse(e.data) as IExpenseDto;
        const expense = this._expenseMappper.toDomainModel(updatedExpense);
        this._sessionExpense$.next(expense);

        const expenses = [...this._userExpenses$.value];
        const expenseIndex = expenses.findIndex((e) => e.expense.id === expense.id);
        if (expenseIndex === -1) {
            return;
        }

        expenses[expenseIndex] = new ExpensePayload(
            this._expenseMappper.toDtoModel(expense),
            expenses[expenseIndex].expenseUsers,
        );
        this._userExpenses$.next(expenses);
    }
}
