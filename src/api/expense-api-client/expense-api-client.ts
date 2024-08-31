import { injectable } from "inversify";
import { IExpenseApiClient } from "./expense-api-client.i";
import { IExpenseDto, IExpensePayerDto, IScanResult } from "@splitsies/shared-models";
import { ClientBase } from "../client-base";
import { lazyInject } from "../../utils/lazy-inject";
import { IAuthProvider } from "../../providers/auth-provider/auth-provider-interface";
import { IUserExpenseDto } from "../../models/user-expense-dto/user-expense-dto-interface";

@injectable()
export class ExpenseApiClient extends ClientBase implements IExpenseApiClient {
    private readonly _authProvider = lazyInject<IAuthProvider>(IAuthProvider);

    constructor() {
        super();
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

    async getExpense(expenseId: string): Promise<IExpenseDto | null> {
        const uri = `${this._config.expense}/${expenseId}`;
        try {
            const expense = await this.get<IExpenseDto>(uri, this._authProvider.provideAuthHeader());
            return expense.data;
        } catch (e) {
            return null;
        }
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

    async createFromExpense(expenseDto: IExpenseDto): Promise<string> {
        try {
            const body = { userId: this._authProvider.provideIdentity(), expense: expenseDto };

            const response = await this.postJson<IExpenseDto>(
                this._config.expense,
                body,
                this._authProvider.provideAuthHeader(),
            );

            return response.success ? response.data.id : "";
        } catch (e) {
            console.error(e);
            return "";
        }
    }

    async createExpense(base64Image: string | undefined = undefined): Promise<string> {
        try {
            const body = { userId: this._authProvider.provideIdentity() };
            const response = await this.postJson<IExpenseDto>(
                this._config.expense,
                body,
                this._authProvider.provideAuthHeader(),
            );

            return response.success ? response.data.id : "";
        } catch (e) {
            console.error(e);
            return "";
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

    async deleteExpense(expenseId: string): Promise<void> {
        try {
            const url = `${this._config.expense}/${expenseId}`;
            await this.delete(url, this._authProvider.provideAuthHeader());
        } catch (e) {
            return;
        }
    }
}
