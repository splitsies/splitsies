import React from "react";
import { ActivityIndicator } from "react-native";
import { Colors, Text, TouchableOpacity, View } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { useObservable } from "../hooks/use-observable";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);

export const SelectItemsControl = SpThemedComponent(() => {
    const awaitingResponse = useObservable(_expenseViewModel.awaitingResponse$, false);
    return (
        <TouchableOpacity onPress={() => _expenseViewModel.setIsSelectingItems(true)}>
            <View flex row centerV style={{ columnGap: 10 }}>
                <ActivityIndicator animating={awaitingResponse} hidesWhenStopped color={Colors.textColor} />
                <Text bodyBold color={Colors.textColor}>
                    Select Items
                </Text>
            </View>
        </TouchableOpacity>
    );
});
