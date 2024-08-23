import { injectable } from "inversify";
import { IRunningTotalCalculator } from "./running-total-calculator.i";
import { IExpense } from "../../models/expense/expense-interface";
import { IPriceCalculator } from "../price-calculator/price-calculator-interface";
import { lazyInject } from "../lazy-inject";

@injectable()
export class RunningTotalCalculator implements IRunningTotalCalculator {
    private readonly _priceCalculator = lazyInject<IPriceCalculator>(IPriceCalculator);

    calculateIndividual(expense: IExpense): number {
        const personalExpenses = expense.users.map((u) =>
            this._priceCalculator.calculatePersonalExpense(u.id, expense),
        );
        const runningTotal = personalExpenses.reduce(
            (previous, current) => previous + parseFloat(current.total.toFixed(2)),
            0,
        );
        const percentage = expense.total === 0 ? 0 : Math.min(Math.ceil((runningTotal * 100) / expense.total), 100);
        return percentage;
    }

    calculate(expense: IExpense): number {
        if (!expense.groupable) return this.calculateIndividual(expense);
        if (expense.children.length === 0) return 0;

        return (
            (expense.children.reduce((sum, currentExpense) => sum + this.calculateIndividual(currentExpense), 0) /
                (expense.children.length * 100)) *
            100
        );
    }
}
