import { injectable } from "inversify";
import { IBalanceCalculator } from "./balance-calculator-interface";
import { BalanceResult } from "../../models/balance-result";
import { IExpense } from "../../models/expense/expense-interface";
import { lazyInject } from "../lazy-inject";
import { IPriceCalculator } from "../price-calculator/price-calculator-interface";

@injectable()
export class BalanceCalculator implements IBalanceCalculator {
    private readonly _priceCalculator = lazyInject<IPriceCalculator>(IPriceCalculator);

    calculate(expense: IExpense, userId: string): BalanceResult {
        if (expense.payers.length === 0) return new BalanceResult(false, 0, "");

        const payer = expense.users.find((u) => u.id === expense.payers[0].userId)!;

        if (payer.id === userId) {
            return new BalanceResult(
                true,
                expense.users.reduce((p, c) => {
                    if (c.id === userId) return p;
                    if (expense.payerStatuses.find((s) => s.userId === c.id)?.settled) return p;
                    return p + this._priceCalculator.calculatePersonalExpense(c.id, expense).total;
                }, 0),
                payer.givenName,
            );
        }

        return new BalanceResult(
            true,
            expense.payerStatuses.find((s) => s.userId === userId)?.settled
                ? 0
                : -this._priceCalculator.calculatePersonalExpense(userId, expense).total,
            payer.givenName,
        );
    }
}
