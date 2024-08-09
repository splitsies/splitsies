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
        if (expense.groupable) {
            const balances = this.calculatePersonBreakdown(expense, userId);
            return new BalanceResult(
                true,
                Array.from(balances.values()).reduce((p, c) => p + c, 0),
                "",
            );
        }

        if (expense.payers.length === 0) return new BalanceResult(false, 0, "");

        const payer = expense.users.find((u) => u.id === expense.payers[0].userId)!;

        if (!payer) {
            return new BalanceResult(false, 0, "");
        }

        if (payer?.id === userId) {
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

    calculatePersonBreakdown(expense: IExpense, personId: string): Map<string, number> {
        const otherUserIds = expense.users.map((u) => u.id).filter((id) => id !== personId);
        const balances = new Map<string, number>();

        for (const userId of otherUserIds) {
            balances.set(userId, 0);
        }

        for (const ex of expense.children) {
            const payerId = ex.payers[0].userId;

            if (payerId === personId) {
                // This person is the payer, need to subtract the amount any other payer owes
                for (const userId of otherUserIds) {
                    const theirBalance = this.calculate(ex, userId);
                    balances.set(userId, balances.get(userId)! - theirBalance.balance);
                }
            } else {
                // This person owes money to the payer
                const balanceResult = this.calculate(ex, personId);
                balances.set(payerId, balances.get(payerId)! + balanceResult.balance);
            }
        }
        return balances;
    }
}
