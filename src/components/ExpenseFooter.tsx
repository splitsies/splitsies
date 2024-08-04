import { Stepper, View } from "react-native-ui-lib";
import { ExpenseItem } from "./ExpenseItem";
import React from "react";
import { IExpenseItem } from "@splitsies/shared-models";
import { IExpense } from "../models/expense/expense-interface";
import { TutorialTip } from "./TutorialTip";

type Props = {
    expense: IExpense;
    isEditing: boolean;
    onItemSelected: (item: IExpenseItem) => void;
};

export const ExpenseFooter = ({ expense, onItemSelected, isEditing }: Props): JSX.Element => {
    return (<TutorialTip group="expense" stepKey="total">
        <View>
            {expense.items.filter((i) => i.isProportional).length > 0 && (
                <ExpenseItem
                    item={{ name: "Subtotal", price: expense.subtotal, owners: [] } as unknown as IExpenseItem}
                />
            )}
            {expense.items
                .filter((i) => i.isProportional)
                .map((pi) => (
                    <ExpenseItem key={pi.id} item={pi} editable={isEditing} onPress={() => onItemSelected(pi)} />
                ))}

            
                <ExpenseItem item={{ name: "Total", price: expense.total, owners: [] } as unknown as IExpenseItem} />
        </View>
        </TutorialTip>
    );
};
