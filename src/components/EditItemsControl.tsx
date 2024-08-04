import React from "react";
import { Colors, Text, TouchableOpacity, View } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { ActivityIndicator } from "react-native";
import { useObservable } from "../hooks/use-observable";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { TutorialTip } from "./TutorialTip";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);

export const EditItemsControl = SpThemedComponent(() => {
    const editing = useObservable(_expenseViewModel.isEditingItems$, false);
    const awaitingResponse = useObservable(_expenseViewModel.awaitingResponse$, false);

    const onSelectAction = () => {
        _expenseViewModel.setIsEditingItems(!editing);
    };

    return (
        <TutorialTip group="expense" stepKey="editItems" placement="bottom">
            <TouchableOpacity onPress={onSelectAction}>
                <View flex row centerV style={{ columnGap: 10 }}>
                    <ActivityIndicator animating={awaitingResponse} hidesWhenStopped color={Colors.textColor} />
                    <Text bodyBold color={Colors.textColor}>
                        {!editing ? "Edit Items" : "Done"}
                    </Text>
                </View>
            </TouchableOpacity>
        </TutorialTip>
    );
});
