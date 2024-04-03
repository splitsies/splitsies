import { ExpenseJoinRequest } from "../../models/expense-join-request/expense-join-request";
import { IExpenseJoinRequest } from "../../models/expense-join-request/expense-join-request-interface";
import { IUsersApiClient } from "../../api/users-api-client/users-api-client-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { IExpenseJoinRequestMapper } from "./expense-join-request-mapper-interface";
import { injectable } from "inversify";
import { IUserExpenseDto } from "../../models/user-expense-dto/user-expense-dto-interface";
import { IExpenseMapper } from "../expense-mapper-interface";

@injectable()
export class ExpenseJoinRequestMapper implements IExpenseJoinRequestMapper {
    private readonly _usersApiClient = lazyInject<IUsersApiClient>(IUsersApiClient);
    private readonly _expenseMapper = lazyInject<IExpenseMapper>(IExpenseMapper);

    async toDomain(dto: IUserExpenseDto): Promise<IExpenseJoinRequest | null> {
        if (!dto.requestingUserId || !dto.createdAt) return null;

        const user = (await this._usersApiClient.requestUsersByIds([dto.requestingUserId]))[0];
        if (!user) return null;

        return new ExpenseJoinRequest(
            dto.userId,
            await this._expenseMapper.toDomain(dto.expense),
            user,
            new Date(dto.createdAt),
        );
    }
}
