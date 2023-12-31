import React, { useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "react-native-ui-lib";
import { ListSeparator } from "../components/ListSeparator";
import { ExpensePreview } from "../components/ExpensePreview";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DrawerParamList, FeedParamList, RootStackScreenParams } from "./root-stack-screen-params";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { race, first, timer, lastValueFrom } from "rxjs";
import { useObservable } from "../hooks/use-observable";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IRequestConfiguration } from "../models/configuration/request-config/request-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";

type Props = CompositeScreenProps<
    CompositeScreenProps<NativeStackScreenProps<RootStackScreenParams>, DrawerScreenProps<DrawerParamList, "Home">>,
    BottomTabScreenProps<FeedParamList, "Expenses">
>;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _requestConfiguration = lazyInject<IRequestConfiguration>(IRequestConfiguration);
const _viewModel = lazyInject<IHomeViewModel>(IHomeViewModel);

export const ExpenseFeedScreen = ({ navigation }: Props): JSX.Element => {
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const expenses = useObservable(_expenseManager.expenses$, _expenseManager.expenses);
    const userName = useObservableReducer(_userManager.user$, "", (userCred) => userCred?.user.givenName ?? "");

    const onExpenseClick = async (expenseId: string) => {
        if (_viewModel.pendingData) return;
        _viewModel.setPendingData(true);
        void _expenseManager.connectToExpense(expenseId);

        const timedExpenseObserver = race(
            _expenseManager.currentExpense$.pipe(first((e) => !!e)),
            timer(_requestConfiguration.connectionTimeoutMs),
        );

        await lastValueFrom(timedExpenseObserver);
        _viewModel.setPendingData(false);
        navigation.navigate("ExpenseScreen");
    };

    const refresh = async (): Promise<void> => {
        setRefreshing(true);
        await _expenseManager.requestForUser();
        setRefreshing(false);
    };

    return expenses.length === 0 ? (
        <View style={styles.welcomeMessageContainer}>
            <ScrollView
                contentContainerStyle={styles.welcomeMessageContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
            >
                <View style={styles.messageBox}>
                    <Text subheading>Welcome, {userName}!</Text>
                </View>
            </ScrollView>
            <View style={styles.hintBox}>
                <Text hint>Tap to scan a receipt</Text>
            </View>
        </View>
    ) : (
        <View style={styles.listContainer}>
            <FlatList
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({ item }) => (
                    <ExpensePreview
                        key={item.expense.id}
                        data={item}
                        onPress={onExpenseClick}
                        onLongPress={() => console.log("LONG")}
                    />
                )}
                data={expenses}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    welcomeMessageContainer: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
    },
    listContainer: {
        display: "flex",
        flexGrow: 1,
        flex: 1,
    },
    messageBox: {
        display: "flex",
        width: "100%",
        alignItems: "center",
        flex: 2,
        justifyContent: "center",
    },
    hintBox: {
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 60,
    },
});
