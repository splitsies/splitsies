import { Colors, TouchableOpacity } from "react-native-ui-lib";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import RemovePerson from "../../assets/icons/remove-person.svg";
import React from "react";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { Alert } from "react-native";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { IExpense } from "../models/expense/expense-interface";

const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

const icon = _uiConfig.sizes.smallIcon;

type Props = {
    person: IExpenseUserDetails;
    expense: IExpense;
};

export const RemovePersonButton = SpThemedComponent(({ person, expense }: Props): JSX.Element => {
    const onRemovePress = (): void => {
        Alert.alert(`Remove Person?`, "Any item selections will be reverted. Do you want to continue?", [
            { text: "Yes", onPress: () => _expenseManager.requestRemoveUserFromExpense(person.id, expense.id) },
            { text: "No", style: "cancel" },
        ]);
    };

    return (
        <TouchableOpacity
            onPress={onRemovePress}
            style={{ backgroundColor: Colors.primary, padding: 7, borderRadius: 20 }}
        >
            <RemovePerson width={icon} height={icon} fill={Colors.bgColor} />
        </TouchableOpacity>
    );
});
