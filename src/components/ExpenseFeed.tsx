import { IExpensePayload } from "@splitsies/shared-models";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { Text, View } from "react-native-ui-lib";
import { ListSeparator } from "./ListSeparator";
import React from "react";
import { ExpensePreview } from "./ExpensePreview";

type Props = {
    isPendingData: boolean;
    expenses: IExpensePayload[];
    userName: string;
    onExpenseClick: (expenseId: string) => Promise<void>;
};

export const ExpenseFeed = ({ isPendingData, expenses, userName, onExpenseClick }: Props): JSX.Element => {
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
                contentContainerStyle={{ paddingBottom: 40 }}
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
