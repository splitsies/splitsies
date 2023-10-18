import { injectable } from "inversify";
import { IExpenseApiClient } from "./expense-api-client-interface";
import { IApiConfig } from "../../models/configuration/api-config/api-config-interface";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpense, IExpenseDto, IExpenseUpdate } from "@splitsies/shared-models";
import { ClientBase } from "../client-base";
import { lazyInject } from "../../utils/lazy-inject";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";
import { IExpenseMapper } from "../../mappers/expense-mapper-interface";

@injectable()
export class ExpenseApiClient extends ClientBase implements IExpenseApiClient {
    private _connection!: WebSocket;
    private readonly _userExpenses$ = new BehaviorSubject<IExpense[]>([]);
    private readonly _sessionExpense$ = new BehaviorSubject<IExpense | null>(null);
    private readonly _config = lazyInject<IApiConfig>(IApiConfig);
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);
    private readonly _expenseMappper = lazyInject<IExpenseMapper>(IExpenseMapper);

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
        try {
            const expenses = await this.get<IExpenseDto[]>(uri, this._authProvider.provideAuthHeader());
            this._userExpenses$.next(expenses.data.map((e) => this._expenseMappper.toDomainModel(e)));
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
        const update = { ...expense, transactionDate: expense.transactionDate.toISOString() } as IExpenseUpdate;

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
        const item = { name, price, owners };

        this._connection.send(
            JSON.stringify({
                id,
                method: "addItem",
                item,
                isProportional,
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
                    const expense = this._expenseMappper.toDomainModel(updatedExpense);
                    this._sessionExpense$.next(expense);

                    const expenses = [...this._userExpenses$.value];
                    const expenseIndex = expenses.findIndex((e) => e.id === expense.id);
                    if (expenseIndex === -1) {
                        return;
                    }

                    expenses[expenseIndex] = expense;
                    this._userExpenses$.next(expenses);
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
