import React from "react";
import { Text, View } from "react-native-ui-lib";
import { IExpense } from "../models/expense/expense-interface";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { ItemSelectionProgressBar } from "./ItemSelectionProgressBar";

type Props = {
    expense: IExpense;
};

export const PeopleFooter = SpThemedComponent(({ expense }: Props): JSX.Element => {
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
                <ItemSelectionProgressBar expense={expense} />
            </View>
        </View>
    );
});
