import { View } from "react-native-ui-lib";
import { ExpenseItem } from "./ExpenseItem";
import React from "react";
import { IExpense, IExpenseItem } from "@splitsies/shared-models";

type Props = {
    expense: IExpense;
    onItemSelected: (item: IExpenseItem) => void;
};

export const ExpenseFooter = ({ expense, onItemSelected }: Props): JSX.Element => {
    return (
        <View>
            <ExpenseItem item={{ name: "Subtotal", price: expense.subtotal, owners: [] } as unknown as IExpenseItem} />

            {expense.items
                .filter((i) => i.isProportional)
                .map((pi) => (
                    <ExpenseItem key={pi.id} item={pi} onPress={() => onItemSelected(pi)} />
                ))}

            <ExpenseItem item={{ name: "Total", price: expense.total, owners: [] } as unknown as IExpenseItem} />
        </View>
    );
};
