import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Dimensions, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lazyInject } from "../utils/lazy-inject";
import { RootStackScreenParams } from "./root-stack-screen-params";
import { Subscription, filter } from "rxjs";
import { IExpense } from "@splitsies/shared-models";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { View, TouchableOpacity, Text } from "react-native-ui-lib/core";
import { Button, Card, Icon, Modal, NumberInput, TextField } from "react-native-ui-lib";
import { format } from "../utils/format-date";
import { ExpenseItem } from "../components/ExpenseItem";
import { EditModal } from "../components/EditModal";
import { EditResult } from "../models/edit-result";

const _dimensions = Dimensions.get("screen");

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

type Props = NativeStackScreenProps<RootStackScreenParams, "ExpenseScreen">;

export const ExpenseScreen = ({ navigation }: Props) => {
    const [expense, setExpense] = useState<IExpense>(_expenseManager.currentExpense!);
    const [editing, setEditing] = useState<boolean>(false);

    useEffect(() => onConnect(), []);

    const onConnect = () => {
        const subscription = new Subscription();

        subscription.add(
            _expenseManager.currentExpense$.pipe(filter((e) => !!e)).subscribe({
                next: (expense) => setExpense(expense!),
            }),
        );

        return () => subscription.unsubscribe();
    };

    const onBackPress = () => {
        _expenseManager.disconnectFromExpense();
        navigation.goBack();
    };

    const onTitleSave = ({ name }: EditResult) => {
        console.log(name);
        const updated = { ...expense, name } as IExpense;
        void _expenseManager.updateExpense(updated);
        setEditing(false);
    };

    const HeaderComponent = () => {
        return (
            <View centerH marginB-15>
                <TouchableOpacity onPress={() => setEditing(!editing)}>
                    <Text heading>{expense.name}</Text>
                </TouchableOpacity>
                <Text subtext>{format(expense.transactionDate)}</Text>
            </View>
        );
    };

    const Separator = () => {
        return (
            <View style={{ width: "100%" }} flex centerH>
                <View style={styles.separator} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View padding-5>
                <TouchableOpacity onPress={() => onBackPress()}>
                    <Icon assetName="arrowBack" size={35} />
                </TouchableOpacity>
            </View>
            <HeaderComponent />
            <FlatList
                ItemSeparatorComponent={Separator}
                renderItem={({ item }) => <ExpenseItem item={item} interactable showInteractable showOwners />}
                data={expense.items}
            />
            <EditModal
                visible={editing}
                nameValue={expense.name}
                showNameField
                onSave={onTitleSave}
                onCancel={() => setEditing(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
        width: "100%",
    },
    separator: {
        height: 1,
        width: "100%",
        backgroundColor: "#BBB",
        marginTop: 10,
        marginBottom: 10,
        opacity: 0.33,
    },
    itemContainer: {
        justifyContent: "space-between",
    },
});
