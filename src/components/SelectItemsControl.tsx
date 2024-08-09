import React from "react";
import { ActivityIndicator } from "react-native";
import { Colors, Text, TouchableOpacity, View } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { useObservable } from "../hooks/use-observable";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { TutorialTip } from "./TutorialTip";
import Select from "../../assets/icons/select.svg"
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

export const SelectItemsControl = SpThemedComponent(() => {
    const awaitingResponse = useObservable(_expenseViewModel.awaitingResponse$, false);
    return (
        <TutorialTip group="people" stepKey="selectItems" placement="bottom">
            <TouchableOpacity onPress={() => _expenseViewModel.setIsSelectingItems(true)}>
                <View flex row centerV style={{ columnGap: 10 }}>
                    <ActivityIndicator animating={awaitingResponse} hidesWhenStopped color={Colors.textColor} />
                    <Select height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
                </View>
            </TouchableOpacity>
        </TutorialTip>
    );
});
