import React, { useEffect, useState } from "react";
import { Colors, ProgressBar, Text, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IExpense } from "../models/expense/expense-interface";
import {
    IRunningTotalCalculator,
    IRunningTotalculator,
} from "../utils/running-total-calculator/running-total-calculator.i";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

const _runningTotalCalculator = lazyInject<IRunningTotalCalculator>(IRunningTotalculator);

type Props = {
    expense: IExpense;
};
export const PeopleFooter = SpThemedComponent(({ expense }: Props): JSX.Element => {
    const [percentage, setPercentage] = useState<number>(_runningTotalCalculator.calculate(expense));
    useEffect(() => {
        setPercentage(_runningTotalCalculator.calculate(expense));
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
                    {percentage.toFixed(0)}%
                </Text>
            </View>
        </View>
    );
});
