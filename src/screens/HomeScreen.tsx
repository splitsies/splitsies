import React, { useState } from "react";
import { SafeAreaView, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { ExpensePreview } from "../components/ExpensePreview";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { View, Text, LoaderScreen } from "react-native-ui-lib";
import { lastValueFrom, first, Subscription, race, timer } from "rxjs";
import { IExpensePayload } from "@splitsies/shared-models";
import { useInitialize } from "../hooks/use-initialize";
import { ListSeparator } from "../components/ListSeparator";
import type { RootStackScreenParams } from "./root-stack-screen-params";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScanButton } from "../components/ScanButton";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IRequestConfiguration } from "../models/configuration/request-config/request-configuration-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _requestConfiguration = lazyInject<IRequestConfiguration>(IRequestConfiguration);

export const HomeScreen = ({ navigation }: NativeStackScreenProps<RootStackScreenParams, "HomeScreen">) => {
    const [expenses, setExpenses] = useState<IExpensePayload[]>(_expenseManager.expenses);
    const [userName, setUserName] = useState<string>(_userManager.user?.user.givenName ?? "");
    const [isPendingData, setIsPendingData] = useState<boolean>(_expenseManager.isPendingExpenseData);
    const [isPendingConnection, setIsPendingConnection] = useState<boolean>(false);

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

    const provideContent = (): JSX.Element => {
        if (isPendingData) {
            return <ActivityIndicator size="large" />;
        }

        if (expenses.length === 0) {
            return (
                <View style={styles.welcomeMessageContainer}>
                    <View style={styles.messageBox}>
                        <Text subheading>Welcome, {userName}!</Text>
                    </View>
                    <View style={styles.hintBox}>
                        <Text hint>Tap to scan a receipt</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.listContainer}>
                <FlatList
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text letterHeading>Splitsies</Text>
                <ActivityIndicator color={_colorConfiguration.black} animating={isPendingConnection} hidesWhenStopped />
            </View>
            <View style={styles.body}>
                {provideContent()}
                <ScanButton onPress={onScanClick} />
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
