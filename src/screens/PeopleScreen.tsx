import React, { useCallback, useState } from "react";
import { People } from "../components/People";
import { useObservable } from "../hooks/use-observable";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IExpense } from "@splitsies/shared-models";
import { Observable, filter } from "rxjs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackScreenParams, ExpenseParamList } from "./root-stack-screen-params";
import { TouchableOpacity, View } from "react-native-ui-lib/core";
import { SafeAreaView, StyleSheet } from "react-native";
import { Icon, Text } from "react-native-ui-lib";
import { PeopleFooter } from "../components/PeopleFooter";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackScreenParams>,
    MaterialTopTabScreenProps<ExpenseParamList, "People">
>;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

export const PeopleScreen = ({ navigation }: Props): JSX.Element => {
    const expenseUsers = useObservable(_expenseManager.currentExpenseUsers$, _expenseManager.currentExpenseUsers);
    const expense = useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => !!e)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
    );
    const [isSelecting, setIsSelecting] = useState<boolean>(false);

    const onBackPress = useCallback(() => {
        _expenseManager.disconnectFromExpense();
        navigation.navigate("RootScreen");
    }, [_expenseManager, navigation]);

    const updateExpenseItemOwners = (userId: string, selectedItemIds: string[]): void => {
        for (const item of expense.items) {
            const idIndex = item.owners.findIndex((u) => u.id === userId);
            const userHasItem = idIndex !== -1;

            if (userHasItem && !selectedItemIds.includes(item.id)) {
                item.owners.splice(idIndex, 1);
            } else if (!userHasItem && selectedItemIds.includes(item.id)) {
                item.owners.push(expenseUsers.find((u) => u.id === userId)!);
            }
        }
        void _expenseManager.updateExpense(expense);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBackPress}>
                    <Icon assetName="arrowBack" size={27} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsSelecting(true)}>
                    <Text bodyBold>Select</Text>
                </TouchableOpacity>
            </View>

            <People
                people={expenseUsers}
                expense={expense}
                updateItemOwners={updateExpenseItemOwners}
                isSelecting={isSelecting}
                endSelectingMode={() => setIsSelecting(false)}
            />

            <View style={styles.footer}>
                <PeopleFooter expense={expense} expenseUsers={expenseUsers} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
        width: "100%",
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 10,
        paddingRight: 15,
        paddingTop: 31,
        width: "100%",
    },
    footer: {
        display: "flex",
        borderTopColor: _colorConfiguration.greyFont,
        borderTopWidth: 1,
        paddingTop: 10,
        rowGap: 10,
    },
});
