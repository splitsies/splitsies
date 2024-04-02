import { IExpenseUserDetailsMapper } from "@splitsies/shared-models";
import { ExpenseJoinRequest } from "../../models/expense-join-request/expense-join-request";
import { IExpenseJoinRequest } from "../../models/expense-join-request/expense-join-request-interface";
import { IUsersApiClient } from "../../api/users-api-client/users-api-client-interface";
import { lazyInject } from "../../utils/lazy-inject";
import { IUserCache } from "../../utils/user-cache/user-cache-interface";
import { IExpenseJoinRequestMapper } from "./expense-join-request-mapper-interface";
import { injectable } from "inversify";
import { IUserExpenseDto } from "../../models/user-expense-dto/user-expense-dto-interface";
import { IExpenseMapper } from "../expense-mapper-interface";

@injectable()
export class ExpenseJoinRequestMapper implements IExpenseJoinRequestMapper {
    private readonly _usersApiClient = lazyInject<IUsersApiClient>(IUsersApiClient);
    private readonly _expenseUserDetailsMapper = lazyInject<IExpenseUserDetailsMapper>(IExpenseUserDetailsMapper);
    private readonly _expenseMapper = lazyInject<IExpenseMapper>(IExpenseMapper);
    private readonly _userCache = lazyInject<IUserCache>(IUserCache);

    async toDomain(dto: IUserExpenseDto): Promise<IExpenseJoinRequest | null> {
        let user = this._userCache.get(dto.requestingUserId ?? "");
        if (!user && dto.requestingUserId) {
            const userDto = (await this._usersApiClient.requestUsersByIds([dto.requestingUserId]))[0];
            console.log({ userDto });
            if (!userDto) return null;

            user = this._expenseUserDetailsMapper.fromUserDto(userDto);
            this._userCache.add(user);
        }

        if (!user || !dto.createdAt) return null;
        return new ExpenseJoinRequest(
            dto.userId,
            await this._expenseMapper.toDomain(dto.expense),
            user,
            new Date(dto.createdAt),
        );
    }
}
