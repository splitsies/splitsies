import React, { useEffect, useState } from "react";
import { Colors, ProgressBar, Slider, Text, View } from "react-native-ui-lib";
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
    const percentage = expense.total === 0 ? 0 : Math.min(Math.ceil((runningTotal * 100) / expense.total), 100);

    useEffect(() => {
        setRunningTotal(calculateRunningTotal(expense));
    }, [expense]);

    return (
        <View>
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 15,
                    columnGap: 10,
                }}
            >
                <Text hint>Selected</Text>
                <ProgressBar
                    style={{ display: "flex", flex: 1, height: 9 }}
                    progressColor={Colors.primary}
                    progress={percentage}
                />
                <Text hint style={{ display: "flex", minWidth: 40, textAlign: "right" }}>
                    {percentage}%
                </Text>
            </View>
        </View>
    );
};
