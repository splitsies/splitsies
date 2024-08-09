import React from "react";
import { Colors, Text, TouchableOpacity, View } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { ActivityIndicator } from "react-native";
import { useObservable } from "../hooks/use-observable";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { TutorialTip } from "./TutorialTip";
import Edit from "../../assets/icons/edit.svg";
import Check from "../../assets/icons/check.svg";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

export const EditItemsControl = SpThemedComponent(() => {
    const editing = useObservable(_expenseViewModel.isEditingItems$, false);
    const awaitingResponse = useObservable(_expenseViewModel.awaitingResponse$, false);

    const onSelectAction = () => {
        _expenseViewModel.setIsEditingItems(!editing);
    };

    return (
        <TouchableOpacity onPress={onSelectAction}>
            <TutorialTip group="expense" stepKey="editItems" placement="bottom">
                <View flex row centerV style={{ columnGap: 10 }}>
                    <ActivityIndicator animating={awaitingResponse} hidesWhenStopped color={Colors.textColor} />
                    {editing ? (
                        <Check height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
                    ) : (
                        <Edit height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
                    )}
                </View>
            </TutorialTip>
        </TouchableOpacity>
    );
});
