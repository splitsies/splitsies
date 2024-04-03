import React, { useEffect, useState } from "react";
import { View } from "react-native-ui-lib";
import { ExpenseItem } from "./ExpenseItem";
import { IExpenseItem, IExpenseUserDetails } from "@splitsies/shared-models";
import { lazyInject } from "../utils/lazy-inject";
import { IPriceCalculator } from "../utils/price-calculator/price-calculator-interface";
import { IExpense } from "../models/expense/expense-interface";

const _priceCalculator = lazyInject<IPriceCalculator>(IPriceCalculator);

type Props = {
    expense: IExpense;
};

const calculateRunningTotal = (expense: IExpense): number => {
    const personalExpenses = expense.users.map((u) => _priceCalculator.calculatePersonalExpense(u.id, expense));
    return personalExpenses.reduce((previous, current) => previous + parseFloat(current.total.toFixed(2)), 0);
};

export const PeopleFooter = ({ expense }: Props): JSX.Element => {
    const [runningTotal, setRunningTotal] = useState<number>(calculateRunningTotal(expense));

    useEffect(() => {
        setRunningTotal(calculateRunningTotal(expense));
    }, [expense]);

    return (
        <View>
            <ExpenseItem item={{ name: "Running Total", price: runningTotal, owners: [] } as unknown as IExpenseItem} />
            <ExpenseItem item={{ name: "Total", price: expense.total, owners: [] } as unknown as IExpenseItem} />
        </View>
    );
};
