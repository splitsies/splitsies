import { inject, injectable, multiInject } from "inversify";
import { IUsersApiClient } from "../api/users-api-client/users-api-client-interface";
import { Expense } from "../models/expense/expense";
import { ExpenseDto, IExpenseDto, IExpenseUserDetailsMapper } from "@splitsies/shared-models";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseMapper } from "./expense-mapper-interface";
import { lazyInject } from "../utils/lazy-inject";

@injectable()
export class ExpenseMapper implements IExpenseMapper {

    private readonly _usersApiClient = lazyInject<IUsersApiClient>(IUsersApiClient);
    private readonly _expenseUserDetailsMapper = lazyInject<IExpenseUserDetailsMapper>(IExpenseUserDetailsMapper);

    toDto(expense: IExpense): IExpenseDto {
        return new ExpenseDto(
            expense.id,
            expense.name,
            expense.transactionDate.toISOString(),
            expense.items,
            expense.users.map(u => u.id)
        );
    }

    async toDomain(dto: IExpenseDto): Promise<IExpense> {
        const users = dto.userIds.length ? await this._usersApiClient.requestUsersByIds(dto.userIds) : [];
        return new Expense(
            dto.id,
            dto.name,
            new Date(dto.transactionDate),
            dto.items,
            users.map(u => this._expenseUserDetailsMapper.fromUserDto(u))
        );        
    }
}