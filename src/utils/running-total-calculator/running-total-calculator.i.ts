import { IExpense } from "../../models/expense/expense-interface";

export interface IRunningTotalCalculator {
    calculateIndividual(expense: IExpense): number;
    calculate(expense: IExpense): number;
}
export const IRunningTotalCalculator = Symbol.for("IRunningTotalCalculator");
