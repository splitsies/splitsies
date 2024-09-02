import React, { useState } from "react";
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
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";
import { zip } from "rxjs";
import { useInitialize } from "../hooks/use-initialize";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _homeViewModel = lazyInject<IHomeViewModel>(IHomeViewModel);

export const EditItemsControl = SpThemedComponent(() => {
    const editing = useObservable(_expenseViewModel.isEditingItems$, false);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    useInitialize(() => {
        const sub = zip([_expenseViewModel.awaitingResponse$, _homeViewModel.pendingData$]).subscribe({
            next: ([expensePendingData, homePendingData]) => {
                setAwaitingResponse(expensePendingData || homePendingData);
            },
        });

        return () => sub.unsubscribe();
    });

    const onSelectAction = () => {
        _expenseViewModel.setIsEditingItems(!editing);
    };

    return (
        <TouchableOpacity onPress={onSelectAction}>
            <TutorialTip group="expense" stepKey="editItems" placement="bottom">
                <View row style={{ columnGap: 10 }}>
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
