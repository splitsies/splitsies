import React, { useState } from "react";
import { IExpensePayload } from "@splitsies/shared-models";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "react-native-ui-lib";
import { ListSeparator } from "./ListSeparator";
import { ExpensePreview } from "./ExpensePreview";

type Props = {
    isPendingData: boolean;
    expenses: IExpensePayload[];
    userName: string;
    onExpenseClick: (expenseId: string) => Promise<void>;
    onRefresh: () => Promise<void>;
};

export const ExpenseFeed = ({ isPendingData, expenses, userName, onExpenseClick, onRefresh }: Props): JSX.Element => {
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const refresh = async (): Promise<void> => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    if (isPendingData) {
        return <ActivityIndicator size="large" />;
    }

    // if (expenses.length === 0) {
    //     return (
    //         <View style={styles.welcomeMessageContainer}>
    //             <ScrollView
    //                 contentContainerStyle={styles.welcomeMessageContainer}
    //                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    //             >
    //                 <View style={styles.messageBox}>
    //                     <Text subheading>Welcome, {userName}!</Text>
    //                 </View>
    //             </ScrollView>
    //             <View style={styles.hintBox}>
    //                 <Text hint>Tap to scan a receipt</Text>
    //             </View>
    //         </View>
    //     );
    // }

    // console.log("returning feed");

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
