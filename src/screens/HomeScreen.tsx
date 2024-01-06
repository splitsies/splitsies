import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { View } from "react-native-ui-lib";
import { lastValueFrom, first, race, timer } from "rxjs";
import { IExpenseJoinRequestDto } from "@splitsies/shared-models";
import { HomeBar } from "../components/HomeBar";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IRequestConfiguration } from "../models/configuration/request-config/request-configuration-interface";
import { ExpenseFeed } from "../components/ExpenseFeed";
import { RequestsFeed } from "../components/RequestsFeed";
import { useObservable } from "../hooks/use-observable";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { CompositeScreenProps } from "@react-navigation/native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackScreenParams, DrawerParamList } from "./root-stack-screen-params";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _requestConfiguration = lazyInject<IRequestConfiguration>(IRequestConfiguration);
const _viewModel = lazyInject<IHomeViewModel>(IHomeViewModel);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackScreenParams>,
    DrawerScreenProps<DrawerParamList, "Home">
>;

export const HomeScreen = ({ navigation }: Props) => {
    const [currentTab, setCurrentTab] = useState<"feed" | "requests">("feed");
    const expenses = useObservable(_expenseManager.expenses$, _expenseManager.expenses);
    const userName = useObservableReducer(_userManager.user$, "", (userCred) => userCred?.user.givenName ?? "");
    const joinRequests = useObservable(_expenseManager.expenseJoinRequests$, []);

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

    const onScanClick = (): void => {
        navigation.navigate("CameraScreen");
    };

    const onRequestsClick = async (): Promise<void> => {
        setCurrentTab("requests");

        _viewModel.setPendingData(true);
        await _expenseManager.requestExpenseJoinRequests();
        _viewModel.setPendingData(false);
    };

    const onFeedClick = async (): Promise<void> => {
        setCurrentTab("feed");

        _viewModel.setPendingData(true);
        await _expenseManager.requestForUser();
        _viewModel.setPendingData(false);
    };

    const onApproveRequest = async (joinRequest: IExpenseJoinRequestDto): Promise<void> => {
        await _expenseManager.requestAddUserToExpense(joinRequest.userId, joinRequest.expense.expense.id);
        await _expenseManager.removeExpenseJoinRequestForUser(joinRequest.expense.expense.id);
    };

    const onDenyRequest = async (joinRequest: IExpenseJoinRequestDto): Promise<void> => {
        await _expenseManager.removeExpenseJoinRequestForUser(joinRequest.expense.expense.id);
    };

    const onRefreshRequests = async (): Promise<void> => {
        return _expenseManager.requestExpenseJoinRequests();
    };

    const onRefreshExpenses = async (): Promise<void> => {
        return _expenseManager.requestForUser();
    };

    const provideContent = (): JSX.Element => {
        switch (currentTab) {
            case "feed":
                return (
                    <ExpenseFeed
                        expenses={expenses}
                        userName={userName}
                        onExpenseClick={onExpenseClick}
                        onRefresh={onRefreshExpenses}
                    />
                );
            case "requests":
                return (
                    <RequestsFeed
                        joinRequests={joinRequests}
                        onApprove={onApproveRequest}
                        onDeny={onDenyRequest}
                        onRefresh={onRefreshRequests}
                    />
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.body}>
                {provideContent()}
                <HomeBar onFeedPress={onFeedClick} onPress={onScanClick} onRequestsPress={onRequestsClick} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 20,
        marginVertical: 20,
    },
    body: {
        display: "flex",
        flexGrow: 1,
        justifyContent: "space-between",
    },
    welcomeMessageContainer: {
        display: "flex",
        flexGrow: 1,
    },
    listContainer: {
        display: "flex",
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
        flex: 1,
        justifyContent: "flex-end",
        paddingBottom: 60,
    },
});
