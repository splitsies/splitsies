import React from "react";
import { Colors, TouchableOpacity } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { useObservable } from "../hooks/use-observable";
import ArrowBack from "../../assets/icons/arrow-back.svg";
import Collapse from "../../assets/icons/collapse.svg";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

export const ExpenseHeaderNavigationButton = () => {
    const selectedChild = useObservable(_expenseViewModel.selectedChild$, undefined);

    return selectedChild ? (
        <TouchableOpacity onPress={() => _expenseViewModel.setSelectedChild(undefined)}>
            <Collapse height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
        </TouchableOpacity>
    ) : (
        <TouchableOpacity onPress={() => _expenseViewModel.onBackPress()}>
            <ArrowBack height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
        </TouchableOpacity>
    );
};
