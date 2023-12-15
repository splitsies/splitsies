import { Expense, ExpenseItem, IExpense, IExpenseItem } from "@splitsies/shared-models";
import { injectable } from "inversify";

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
                    items.push(new ExpenseItem(i.id, i.name, i.price / i.owners.length, i.owners, i.isProportional));
                }
            });

        // Put it into an expense to have it calculate subtotal and use that to
        // calculate the proportional split on each proportional item
        const personalExpense = new Expense(expense.id, expense.name, expense.transactionDate, items);
        const proportionalItems: IExpenseItem[] = [];
        expense.items
            .filter((i) => i.isProportional)
            .forEach((i) => {
                proportionalItems.push(
                    new ExpenseItem(
                        i.id,
                        i.name,
                        i.price * (personalExpense.subtotal / (expense.total === 0 ? 1 : expense.total)),
                        i.owners,
                        i.isProportional,
                    ),
                );
            });

        // Add proportional items back into the expense so it's complete
        personalExpense.items.push(...proportionalItems);
        return personalExpense;
    }
}
