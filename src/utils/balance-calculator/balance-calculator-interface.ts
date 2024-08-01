import { BalanceResult } from "../../models/balance-result";
import { IExpense } from "../../models/expense/expense-interface";

export interface IBalanceCalculator {
    calculate(expense: IExpense, userId: string): BalanceResult;
}
export const IBalanceCalculator = Symbol.for("IBalanceCalculator");
