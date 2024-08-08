import React, { useCallback } from "react";
import { People } from "../components/People";
import { useObservable } from "../hooks/use-observable";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { Observable, filter } from "rxjs";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ExpenseParamList } from "../types/params";
import { View } from "react-native-ui-lib/core";
import { SafeAreaView, StyleSheet } from "react-native";
import { PeopleFooter } from "../components/PeopleFooter";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { Container } from "../components/Container";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { ListSeparator } from "../components/ListSeparator";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    MaterialTopTabScreenProps<ExpenseParamList, "People">
>;

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

export const PeopleGroupScreen = SpThemedComponent(({ navigation }: Props): JSX.Element => {
    const isSelecting = useObservable(_expenseViewModel.isSelectingItems$, false);
    const expense = useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => !!e)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
        () => _expenseViewModel.setAwaitingResponse(false),
    );

    const selectedChild = useObservable(_expenseViewModel.selectedChild$, undefined);

    useFocusEffect(
        useCallback(() => {
            _expenseViewModel.onBackPress = onBackPress;
            _expenseViewModel.setScreen("People");
        }, []),
    );

    const onBackPress = useCallback(() => {
        navigation.navigate("Items");
    }, [_expenseManager, navigation]);

    const updateExpenseItemOwners = (userId: string, selectedItemIds: string[]): void => {
        if (!selectedChild) return;

        const user = expense.users.find((u) => u.id === userId);
        if (!user) return;
        _expenseManager.updateItemSelections(selectedChild.id, user, selectedItemIds);
        _expenseViewModel.setAwaitingResponse(true);
    };

    return !expense ? (
        <View />
    ) : (
        <Container>
            <SafeAreaView style={styles.container}>
                <View flex-1>
                    <People
                        people={expense.users}
                        expense={expense}
                        updateItemOwners={updateExpenseItemOwners}
                        isSelecting={isSelecting}
                        endSelectingMode={() => _expenseViewModel.setIsSelectingItems(false)}
                    />
                </View>

                <View style={styles.footer}>
                    <ListSeparator />
                    <PeopleFooter expense={selectedChild ?? expense} />
                </View>
            </SafeAreaView>
        </Container>
    );
});

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
        rowGap: 10,
        paddingVertical: 10,
    },
});
