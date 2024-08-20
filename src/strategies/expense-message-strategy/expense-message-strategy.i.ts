import { ExpenseMessage, IExpenseDto } from "@splitsies/shared-models";

export interface IExpenseMessageStrategy {
    process(message: ExpenseMessage, current: IExpenseDto): Promise<IExpenseDto>;
}

export const IExpenseMessageStrategy = Symbol.for("IExpenseMessageStrategy");