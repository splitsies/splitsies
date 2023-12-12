import React, { useState } from "react";
import { SafeAreaView, FlatList, StyleSheet } from "react-native";
import { ExpensePreview } from "../components/ExpensePreview";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { View, Text } from "react-native-ui-lib";
import { lastValueFrom, first } from "rxjs";
import { IExpensePayload } from "@splitsies/shared-models";
import { useInitialize } from "../hooks/use-initialize";
import { ListSeparator } from "../components/ListSeparator";
import type { RootStackScreenParams } from "./root-stack-screen-params";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScanButton } from "../components/ScanButton";
import { IUserManager } from "../managers/user-manager/user-manager-interface";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);

export const HomeScreen = ({ navigation }: NativeStackScreenProps<RootStackScreenParams, "HomeScreen">) => {
    const [expenses, setExpenses] = useState<IExpensePayload[]>(_expenseManager.expenses);
    const [userName, setUserName] = useState<string>(_userManager.user?.user.givenName ?? "");

    useInitialize(() => {
        const subscription = _expenseManager.expenses$.subscribe({
            next: (data) => setExpenses(data),
        });

        subscription.add(
            _userManager.user$.subscribe({
                next: (user) => setUserName(user?.user.givenName ?? ""),
            }),
        );

        return () => subscription.unsubscribe();
    });

    const onExpenseClick = async (expenseId: string) => {
        await _expenseManager.connectToExpense(expenseId);
        await lastValueFrom(_expenseManager.currentExpense$.pipe(first((e) => !!e)));
        navigation.navigate("ExpenseScreen");
    };

    const onScanClick = (): void => {
        navigation.navigate("CameraScreen");
    };

    const provideContent = (): JSX.Element => {
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
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View marginT-20 marginL-20 marginB-15 centerV>
                <Text letterHeading>Splitsies</Text>
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
    body: {
        display: "flex",
        flexGrow: 1,
        justifyContent: "space-between",
    },
    welcomeMessageContainer: {
        display: "flex",
        flexGrow: 1,
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
