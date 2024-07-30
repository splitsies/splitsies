import { injectable } from "inversify";
import { IUsersApiClient } from "../api/users-api-client/users-api-client-interface";
import { Expense } from "../models/expense/expense";
import { ExpenseDto, IExpenseDto, IExpenseUserDetails } from "@splitsies/shared-models";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseMapper } from "./expense-mapper-interface";
import { lazyInject } from "../utils/lazy-inject";

@injectable()
export class ExpenseMapper implements IExpenseMapper {
    private readonly _usersApiClient = lazyInject<IUsersApiClient>(IUsersApiClient);

    toDto(expense: IExpense): IExpenseDto {
        return new ExpenseDto(
            expense.id,
            expense.name,
            expense.transactionDate.toISOString(),
            expense.items,
            expense.users.map((u) => u.id),
            expense.payers
        );
    }

    async toDomain(dto: IExpenseDto): Promise<IExpense> {
        const users = await this._usersApiClient.requestUsersByIds(dto.userIds);
        return new Expense(
            dto.id,
            dto.name,
            new Date(dto.transactionDate),
            dto.items,
            dto.userIds
                .map((id) => users.find((u) => u.id === id))
                .filter((u) => u !== undefined) as IExpenseUserDetails[],
            dto.payers
        );
    }

    async toDomainBatch(dtos: IExpenseDto[]): Promise<IExpense[]> {
        const userIds = new Set(dtos.map((dto) => dto.userIds).reduce((p, c) => [...p, ...c], []));
        const users = await this._usersApiClient.requestUsersByIds(Array.from(userIds));

        return dtos.map(
            (dto) =>
                new Expense(
                    dto.id,
                    dto.name,
                    new Date(dto.transactionDate),
                    dto.items,
                    dto.userIds
                        .map((id) => users.find((u) => u.id === id))
                        .filter((u) => u !== undefined) as IExpenseUserDetails[],
                    dto.payers
                ),
        );
    }
}
