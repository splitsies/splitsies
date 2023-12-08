import React, { useState } from "react";
import { SafeAreaView, FlatList } from "react-native";
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

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

export const HomeScreen = ({ navigation }: NativeStackScreenProps<RootStackScreenParams, "HomeScreen">) => {
    const [expenses, setExpenses] = useState<IExpensePayload[]>(_expenseManager.expenses);

    useInitialize(() => {
        const subscription = _expenseManager.expenses$.subscribe({
            next: (data) => setExpenses(data),
        });

        return () => subscription.unsubscribe();
    });

    const onExpenseClick = async (expenseId: string) => {
        await _expenseManager.connectToExpense(expenseId);
        await lastValueFrom(_expenseManager.currentExpense$.pipe(first((e) => !!e)));
        navigation.navigate("ExpenseScreen");
    };

    return (
        <SafeAreaView>
            <View marginT-40 marginL-20 marginB-15 centerV>
                <Text letterHeading>Splitsies</Text>
            </View>
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
                stickyHeaderIndices={[0]}
            />
        </SafeAreaView>
    );
};
