import { IExpenseJoinRequest } from "../../models/expense-join-request/expense-join-request-interface";
import { IUserExpenseDto } from "../../models/user-expense-dto/user-expense-dto-interface";

export interface IExpenseJoinRequestMapper {
    toDomain(dto: IUserExpenseDto): Promise<IExpenseJoinRequest | null>;
}
export const IExpenseJoinRequestMapper = Symbol.for("IExpenseJoinRequestMapper");
