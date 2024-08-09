import { ExpenseItem, IExpenseItem } from "@splitsies/shared-models";
import { injectable } from "inversify";
import { IExpense } from "../../models/expense/expense-interface";
import { Expense } from "../../models/expense/expense";

@injectable()
export class PriceCalculator {
    calculatePersonalExpense(userId: string, expense: IExpense): IExpense {
        // Do the individual items first to get a subtotal so we can calculate
        // the ratio for the proportional item split
        const items: IExpenseItem[] = [];
        expense.items
            .filter((i) => !i.isProportional)
            .forEach((i) => {
                if (i.owners.some((o) => o.id === userId)) {
                    items.push(
                        new ExpenseItem(
                            i.id,
                            i.expenseId,
                            i.name,
                            i.price / i.owners.length,
                            i.owners,
                            i.isProportional,
                            i.createdAt,
                        ),
                    );
                }
            });

        // Put it into an expense to have it calculate subtotal and use that to
        // calculate the proportional split on each proportional item
        const personalExpense = new Expense(
            expense.id,
            expense.name,
            expense.transactionDate,
            items,
            expense.users,
            expense.payers,
            expense.payerStatuses,
            expense.children,
        );
        const proportionalItems: IExpenseItem[] = [];
        expense.items
            .filter((i) => i.isProportional)
            .forEach((i) => {
                proportionalItems.push(
                    new ExpenseItem(
                        i.id,
                        i.expenseId,
                        i.name,
                        i.price * (personalExpense.subtotal / (expense.subtotal === 0 ? 1 : expense.subtotal)),
                        i.owners,
                        i.isProportional,
                        i.createdAt,
                    ),
                );
            });

        // Add proportional items back into the expense so it's complete
        personalExpense.items.push(...proportionalItems);
        return personalExpense;
    }
}
