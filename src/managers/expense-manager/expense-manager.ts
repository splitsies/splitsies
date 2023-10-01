import { injectable } from "inversify";
import { IExpenseManager } from "./expense-manager-interface";
import { IExpense } from "@splitsies/shared-models";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpenseApiClient } from "../../api/expense-api-client/expense-api-client-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { BaseManager } from "../base-manager";

@injectable()
export class ExpenseManager extends BaseManager implements IExpenseManager {
    private readonly _api = lazyInject<IExpenseApiClient>(IExpenseApiClient);
    private readonly _expenses$ = new BehaviorSubject<IExpense[]>([]);
    private readonly _currentExpense$ = new BehaviorSubject<IExpense | null>(null);

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

    constructor() {
        super();
    }

    protected async initialize(): Promise<void> {
        this._api.userExpenses$.subscribe({
            next: (data) => this._expenses$.next(data),
        });

        this._api.sessionExpense$.subscribe({
            next: (data) => this._currentExpense$.next(data),
        });
    }

    async requestForUser(userId: string): Promise<void> {
        this._api.getAllExpenses(userId);
    }

    async connectToExpense(expenseId: string): Promise<void> {
        await this._api.connectToExpense(expenseId);
    }

    disconnectFromExpense(): void {
        this._api.disconnectFromExpense();
    }
}
