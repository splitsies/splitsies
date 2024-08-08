import { Stepper, View } from "react-native-ui-lib";
import { ExpenseItem } from "./ExpenseItem";
import React from "react";
import { IExpenseItem } from "@splitsies/shared-models";
import { IExpense } from "../models/expense/expense-interface";
import { TutorialTip } from "./TutorialTip";

type Props = {
    expense: IExpense;
}

export const ExpenseGroupFooter = ({ expense }: Props): JSX.Element => {
    return (
        <TutorialTip group="expense" stepKey="total" renderOnLayout>
            <View>
                <ExpenseItem item={{ name: "Total", price: expense.groupTotal, owners: [] } as unknown as IExpenseItem} />
            </View>
        </TutorialTip>
    );
};
