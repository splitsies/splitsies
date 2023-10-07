import { useState, useEffect } from "react";
import { SafeAreaView, FlatList } from "react-native";
import { ExpensePreview } from "../components/ExpensePreview";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import React from "react";
import { View, Text } from "react-native-ui-lib";
import type { RootStackScreenParams } from "./root-stack-screen-params";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

export const HomeScreen = ({ navigation }: NativeStackScreenProps<RootStackScreenParams, "HomeScreen">) => {
    const [expenses, setExpenses] = useState(_expenseManager.expenses);

    useEffect(() => onConnect(), []);

    const onConnect = () => {
        const subscription = _expenseManager.expenses$.subscribe({
            next: (data) => setExpenses(data),
        });

        return () => subscription.unsubscribe();
    };

    const onExpenseClick = () => {
        navigation.navigate("LoginScreen");
    };

    const FlatListItemSeparator = () => {
        return (
            <View style={{ width: "100%" }} flex centerH>
                <View
                    style={{
                        height: 1,
                        width: "75%",
                        backgroundColor: "#BBB",
                        marginTop: 10,
                        marginBottom: 10,
                        opacity: 0.33
                    }}
                />
            </View>
        );
    }
    
    const HeaderComponent = () => {
        return (
            <View marginT-40 marginL-20 marginB-15 centerV>
                <Text letterHeading>Splitsies</Text>
            </View>
        );
    }

    return (
        <SafeAreaView>
            <FlatList
                ListHeaderComponent={HeaderComponent}
                ItemSeparatorComponent={FlatListItemSeparator}
                renderItem={({ item }) => (
                    <ExpensePreview
                        key={item.id}
                        data={item}
                        onPress={onExpenseClick}
                        onLongPress={() => console.log("LONG")}
                    />
                ) }
                
                data={expenses}
            />
        </SafeAreaView>
    );
}