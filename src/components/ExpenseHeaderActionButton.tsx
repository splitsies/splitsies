import React from "react";
import { Colors, TouchableOpacity, View } from "react-native-ui-lib/core";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { useObservable } from "../hooks/use-observable";
import { lazyInject } from "../utils/lazy-inject";
import { AddGuestControl } from "./AddGuestControl";
import { EditItemsControl } from "./EditItemsControl";
import { ScanUserQrControl } from "./ScanUserQrControl";
import { SelectItemsControl } from "./SelectItemsControl";
import { IExpense } from "../models/expense/expense-interface";
import { Alert } from "react-native";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import Add from "../../assets/icons/add.svg";
import { TutorialTip } from "./TutorialTip";
import Edit from "../../assets/icons/edit.svg";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = {
    currentExpense: IExpense;
};

export const ExpenseHeaderActionButton = ({ currentExpense }: Props) => {
    const selectedChild = useObservable(_expenseViewModel.selectedChild$, undefined);
    const screen = useObservable(_expenseViewModel.screen$, "Items");

    const onAddPress = () => {
        Alert.alert(`Create an empty expense?`, "", [
            { text: "Yes", onPress: () => void onCreateExpense() },
            { text: "No", style: "cancel" },
        ]);
    };

    const onCreateExpense = async () => {
        _expenseViewModel.setAwaitingResponse(true);
        await _expenseManager.createExpense();
        _expenseViewModel.setAwaitingResponse(false);
    };

    const renderButton = (): React.ReactNode | null => {
        switch (screen) {
            case "Items":
                return !currentExpense?.groupable || !!selectedChild ? (
                    <EditItemsControl />
                ) : (
                    <View>
                        <TouchableOpacity onPress={onAddPress}>
                            <Add width={_uiConfig.sizes.icon} height={_uiConfig.sizes.icon} fill={Colors.textColor} />
                        </TouchableOpacity>
                    </View>
                );
            case "People":
                return currentExpense?.children.length === 0 || !!selectedChild ? <SelectItemsControl /> : null;
            case "Guests":
                return <AddGuestControl />;
            case "Contacts":
            case "Search":
                return <ScanUserQrControl />;
        }
    };

    return <View>{renderButton()}</View>;
};
