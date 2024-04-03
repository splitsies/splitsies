import { IExpenseDto } from "@splitsies/shared-models";
import { IExpense } from "../models/expense/expense-interface";

export interface IExpenseMapper {
    toDto(expense: IExpense): IExpenseDto;
    toDomain(dto: IExpenseDto): Promise<IExpense>;
    toDomainBatch(dtos: IExpenseDto[]): Promise<IExpense[]>;
}
export const IExpenseMapper = Symbol.for("IExpenseMapper");
