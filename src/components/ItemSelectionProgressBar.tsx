import React from "react";
import { useState, useEffect } from "react";
import { IExpense } from "../models/expense/expense-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IRunningTotalCalculator } from "../utils/running-total-calculator/running-total-calculator.i";
import { Colors, ProgressBar, Text, View } from "react-native-ui-lib";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

type Props = {
    expense: IExpense;
    style?: object;
};

const _runningTotalCalculator = lazyInject<IRunningTotalCalculator>(IRunningTotalCalculator);

export const ItemSelectionProgressBar = SpThemedComponent(({ expense, style }: Props) => {
    const [percentage, setPercentage] = useState<number>(_runningTotalCalculator.calculate(expense));

    useEffect(() => {
        setPercentage(_runningTotalCalculator.calculate(expense));
    }, [expense]);

    return (
        <View style={{ display: "flex", flex: 1, flexDirection: "row", alignItems: "center" }}>
            <ProgressBar
                style={[{ display: "flex", flex: 1, height: 9 }, style]}
                progressColor={Colors.primary}
                progress={percentage}
            />
            <Text hint style={{ display: "flex", minWidth: 40, textAlign: "right" }}>
                {percentage.toFixed(0)}%
            </Text>
        </View>
    );
});
