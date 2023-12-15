import React, { useEffect, useState } from "react";
import { View } from "react-native-ui-lib";
import { ExpenseItem } from "./ExpenseItem";
import { IExpense, IExpenseItem, IExpenseUserDetails } from "@splitsies/shared-models";
import { lazyInject } from "../utils/lazy-inject";
import { IPriceCalculator } from "../utils/price-calculator/price-calculator-interface";

const _priceCalculator = lazyInject<IPriceCalculator>(IPriceCalculator);

type Props = {
    expense: IExpense;
    expenseUsers: IExpenseUserDetails[];
};

const calculateRunningTotal = ({ expense, expenseUsers }: Props): number => {
    const personalExpenses = expenseUsers.map((u) => _priceCalculator.calculatePersonalExpense(u.id, expense));
    return personalExpenses.reduce((previous, current) => previous + parseFloat(current.total.toFixed(2)), 0);
};

export const PeopleFooter = ({ expense, expenseUsers }: Props): JSX.Element => {
    const [runningTotal, setRunningTotal] = useState<number>(calculateRunningTotal({ expense, expenseUsers }));

    useEffect(() => {
        setRunningTotal(calculateRunningTotal({ expense, expenseUsers }));
    }, [expenseUsers, expense]);

    return (
        <View>
            <ExpenseItem item={{ name: "Running Total", price: runningTotal, owners: [] } as unknown as IExpenseItem} />
            <ExpenseItem item={{ name: "Total", price: expense.total, owners: [] } as unknown as IExpenseItem} />
        </View>
    );
};
