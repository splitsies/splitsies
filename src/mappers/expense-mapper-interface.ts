import { IExpense, IExpenseDto } from "@splitsies/shared-models";

export interface IExpenseMapper {
    toDtoModel(expense: IExpense): IExpenseDto;
    toDomainModel(expenseDto: IExpenseDto): IExpense;
}

export const IExpenseMapper = Symbol.for("IExpenseMapper");
