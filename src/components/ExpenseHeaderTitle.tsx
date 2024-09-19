import React, { useState } from "react";
import { IExpense } from "../models/expense/expense-interface";
import { Colors, Text, TouchableOpacity } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { TextField, View } from "react-native-ui-lib";
import { useObservable } from "../hooks/use-observable";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { StyleSheet } from "react-native";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { EditResult } from "../models/edit-result";
import { EditModal } from "./EditModal";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

type Props = {
    currentExpense: IExpense;
};

export const ExpenseHeaderTitle = ({ currentExpense }: Props) => {
    const selectedChild = useObservable(_expenseViewModel.selectedChild$, undefined);
    const searchVisible = useObservable(_expenseViewModel.searchVisible$, false);
    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);

    const onTitleSave = ({ name }: EditResult) => {
        if (selectedChild) {
            _expenseManager.updateExpenseName(selectedChild.id, name ?? "");
        } else {
            _expenseManager.updateExpenseName(currentExpense!.id, name ?? "");
        }

        setEditingTitle(false);
        _expenseViewModel.setAwaitingResponse(true);
    };

    return (
        <View style={styles.container}>
            {searchVisible ? (
                <TextField
                    body
                    autoCapitalize="none"
                    bg-screenBG
                    placeholder="Search"
                    placeholderTextColor={Colors.greyFont}
                    value={searchFilter}
                    containerStyle={{ width: "100%" }}
                    style={styles.textInput}
                    onChangeText={(text) => _inviteViewModel.setSearchFilter(text)}
                />
            ) : (
                <TouchableOpacity onPress={() => setEditingTitle(!editingTitle)}>
                    <Text
                        letterSubheading
                        color={Colors.textColor}
                        style={[styles.headerLabel]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                    >
                        {selectedChild?.name ?? currentExpense!.name}
                    </Text>
                </TouchableOpacity>
            )}

            <EditModal
                visible={editingTitle}
                nameValue={selectedChild?.name ?? currentExpense!.name}
                onSave={onTitleSave}
                onCancel={() => setEditingTitle(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    headerLabel: {
        textAlign: "center",
        minWidth: 200,
        minHeight: 30,
    },
    textInput: {
        display: "flex",
        flexGrow: 1,
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: _colorConfiguration.divider,
    },
});
