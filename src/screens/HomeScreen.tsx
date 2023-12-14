import React, { useState } from "react";
import { SafeAreaView, StyleSheet, ActivityIndicator } from "react-native";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { View, Text } from "react-native-ui-lib";
import { lastValueFrom, first, Subscription, race, timer } from "rxjs";
import { IExpenseJoinRequestDto, IExpensePayload } from "@splitsies/shared-models";
import { useInitialize } from "../hooks/use-initialize";
import type { RootStackScreenParams } from "./root-stack-screen-params";
import { HomeBar } from "../components/HomeBar";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IRequestConfiguration } from "../models/configuration/request-config/request-configuration-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ExpenseFeed } from "../components/ExpenseFeed";
import { RequestsFeed } from "../components/RequestsFeed";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _requestConfiguration = lazyInject<IRequestConfiguration>(IRequestConfiguration);

export const HomeScreen = ({ navigation }: BottomTabScreenProps<RootStackScreenParams, "HomeScreen">) => {
    const [expenses, setExpenses] = useState<IExpensePayload[]>(_expenseManager.expenses);
    const [userName, setUserName] = useState<string>(_userManager.user?.user.givenName ?? "");
    const [isPendingData, setIsPendingData] = useState<boolean>(_expenseManager.isPendingExpenseData);
    const [isPendingConnection, setIsPendingConnection] = useState<boolean>(false);
    const [currentTab, setCurrentTab] = useState<"feed" | "requests">("feed");
    const [joinRequests, setJoinRequests] = useState<IExpenseJoinRequestDto[]>([]);

    useInitialize(() => {
        const subscription = new Subscription();
        subscription.add(
            _expenseManager.expenses$.subscribe({
                next: (data) => setExpenses(data),
            }),
        );

        subscription.add(
            _expenseManager.isPendingExpenseData$.subscribe({
                next: (value) => setIsPendingData(value),
            }),
        );

        subscription.add(
            _userManager.user$.subscribe({
                next: (user) => setUserName(user?.user.givenName ?? ""),
            }),
        );

        subscription.add(
            _expenseManager.expenseJoinRequests$.subscribe({
                next: (requests) => {
                    setJoinRequests([...requests]);
                },
            }),
        );

        return () => subscription.unsubscribe();
    });

    const onExpenseClick = async (expenseId: string) => {
        if (isPendingConnection) return;

        setIsPendingConnection(true);
        void _expenseManager.connectToExpense(expenseId);

        const timedExpenseObserver = race(
            _expenseManager.currentExpense$.pipe(first((e) => !!e)),
            timer(_requestConfiguration.connectionTimeoutMs),
        );

        await lastValueFrom(timedExpenseObserver);
        setIsPendingConnection(false);
        navigation.navigate("ExpenseScreen");
    };

    const onScanClick = (): void => {
        navigation.navigate("CameraScreen");
    };

    const onRequestsClick = async (): Promise<void> => {
        setCurrentTab("requests");

        setIsPendingConnection(true);
        await _expenseManager.requestExpenseJoinRequests();
        setIsPendingConnection(false);
    };

    const onFeedClick = (): void => {
        setCurrentTab("feed");
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
                        isPendingData={isPendingData}
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
            <View style={styles.header}>
                <Text letterHeading>Splitsies</Text>
                <ActivityIndicator color={_colorConfiguration.black} animating={isPendingConnection} hidesWhenStopped />
            </View>
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
