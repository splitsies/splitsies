import React from "react";
import { IExpense } from "../models/expense/expense-interface";
import { ExpenseItem as ExpenseItemModel } from "@splitsies/shared-models";
import { ExpenseItem } from "./ExpenseItem";
import { lazyInject } from "../utils/lazy-inject";
import { IBalanceCalculator } from "../utils/balance-calculator/balance-calculator-interface";
import { View } from "react-native-ui-lib/core";

const _balanceCalculator = lazyInject<IBalanceCalculator>(IBalanceCalculator);

type Props = {
    expense: IExpense;
    primaryUserId: string;
    comparedUserId: string;
};

export const BalanceSummary = ({ expense, primaryUserId, comparedUserId }: Props): React.ReactNode => {

    const render = (): React.ReactNode[] => {
        const nodes = [];
        const expensesPaidByUsers = expense.children
            .filter(e => e.payers[0]?.userId === primaryUserId || e.payers[0]?.userId === comparedUserId);

        for (const c of expensesPaidByUsers) {
            const balanceResult = c.payers[0]?.userId === primaryUserId
                ? _balanceCalculator.calculate(c, comparedUserId)
                : _balanceCalculator.calculate(c, primaryUserId);
            
            const expenseItem = new ExpenseItemModel("", c.id, c.name, Math.abs(balanceResult.balance), [], false, Date.now());
            
            nodes.push(
                <ExpenseItem
                    item={expenseItem}
                    pricePrefix={c.payers[0]?.userId === primaryUserId ? "Owes you" : "You owe"}
                />
            );
        }

        return nodes;
    };

    return <View>{render()}</View>;
};