import { injectable } from "inversify";
import { IExpenseApiClient } from "./expense-api-client-interface";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpense, IExpenseDto, IExpenseUpdate } from "@splitsies/shared-models";
import { ClientBase } from "../client-base";
import { lazyInject } from "../../utils/lazy-inject";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";

@injectable()
export class ExpenseApiClient extends ClientBase implements IExpenseApiClient {
    private _connection!: WebSocket;
    private readonly _userExpenses$ = new BehaviorSubject<IExpense[]>([]);
    private readonly _sessionExpense$ = new BehaviorSubject<IExpense | null>(null);
    private readonly _config = lazyInject<IApiConfig>(IApiConfig);
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);

    constructor() {
        super();
    }

    get userExpenses$(): Observable<IExpense[]> {
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
        const expenses = await this.get<IExpense[]>(uri, this._authProvider.provideAuthHeader());
        this._userExpenses$.next(expenses.data.map((e) => ({ ...e, transactionDate: new Date(e.transactionDate) })));
    }

    async getExpense(expenseId: string): Promise<void> {
        const uri = `${this._config.expense}/${expenseId}`;
        try {
            const expense = await this.get<IExpense>(uri, this._authProvider.provideAuthHeader());
            this._sessionExpense$.next({ ...expense.data, transactionDate: new Date(expense.data.transactionDate) });
        } catch (e) {
            console.error(e);
        }
    }

    async updateExpense(expense: IExpense): Promise<void> {
        const { id } = expense;
        const update = { ...expense, transactionDate: expense.transactionDate.toISOString() } as IExpenseUpdate;

        this._connection.send(
            JSON.stringify({
                id,
                expense: update,
            }),
        );
    }

    async connectToExpense(expenseId: string): Promise<void> {
        const socketUri = `${
            this._config.expenseSocket
        }?expenseId=${expenseId}&authToken=${this._authProvider.provideAuthToken()}`;
        const onConnected = new Promise<void>((res, rej) => {
            try {
                this._connection = new WebSocket(socketUri);

                this._connection.onopen = async () => {
                    await this.getExpense(expenseId);
                    res();
                };

                this._connection.onmessage = (e) => {
                    const updatedExpense = JSON.parse(e.data) as IExpenseDto;
                    const expense = {
                        ...updatedExpense,
                        transactionDate: new Date(updatedExpense.transactionDate),
                    } as IExpense;

                    this._sessionExpense$.next(expense);
                };
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
}
