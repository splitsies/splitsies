import { injectable } from "inversify";
import { IExpenseManager } from "./expense-manager-interface";
import {
    IExpense,
    IExpenseUserDetails,
    IExpenseUserDetailsMapper,
    IUserCredential,
    IUserDto,
} from "@splitsies/shared-models";
import { BehaviorSubject, Observable } from "rxjs";
import { IExpenseApiClient } from "../../api/expense-api-client/expense-api-client-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { BaseManager } from "../base-manager";
import { IUserManager } from "../user-manager/user-manager-interface";

@injectable()
export class ExpenseManager extends BaseManager implements IExpenseManager {
    private readonly _api = lazyInject<IExpenseApiClient>(IExpenseApiClient);
    private readonly _userManager = lazyInject<IUserManager>(IUserManager);
    private readonly _expenseUserDetailsMapper = lazyInject<IExpenseUserDetailsMapper>(IExpenseUserDetailsMapper);
    private readonly _expenses$ = new BehaviorSubject<IExpense[]>([]);
    private readonly _currentExpense$ = new BehaviorSubject<IExpense | null>(null);
    private readonly _currentExpenseUsers$ = new BehaviorSubject<IExpenseUserDetails[]>([]);

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

    get currentExpenseUsers$(): Observable<IExpenseUserDetails[]> {
        return this._currentExpenseUsers$.asObservable();
    }

    get currentExpenseUsers(): IExpenseUserDetails[] {
        return this._currentExpenseUsers$.value;
    }

    constructor() {
        super();
    }

    updateExpense(expense: IExpense): Promise<void> {
        return this._api.updateExpense(expense);
    }

    addItemToExpense(
        id: string,
        name: string,
        price: number,
        owners: string[],
        isProportional: boolean,
    ): Promise<void> {
        return this._api.addItemToExpense(id, name, price, owners, isProportional);
    }

    protected async initialize(): Promise<void> {
        await this._userManager.initialized;
        this._userManager.user$.subscribe({
            next: (user) => this.onUserCredentialUpdated(user),
        });

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

    async requestUsersForExpense(expenseId: string): Promise<void> {
        const userIds = await this._api.getUserIdsForExpense(expenseId);
        const users = await this._userManager.requestUsersByIds(userIds);

        this._currentExpenseUsers$.next(users.map((u) => this._expenseUserDetailsMapper.fromUserDto(u)));
    }

    async requestAddUserToExpense(userId: string, expenseId: string): Promise<void> {
        await this._api.addUserToExpense(userId, expenseId);
        void this.requestUsersForExpense(expenseId);
    }

    async requestRemoveUserFromExpense(userId: string, expenseId: string): Promise<void> {
        await this._api.removeUserFromExpense(userId, expenseId);
        void this.requestUsersForExpense(expenseId);
    }

    disconnectFromExpense(): void {
        this._api.disconnectFromExpense();
    }

    private async onUserCredentialUpdated(userCredential: IUserCredential | null): Promise<void> {
        this._api.disconnectFromExpense();
        this._api.getAllExpenses(userCredential?.user.id ?? "");
    }
}
