import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { View } from "react-native-ui-lib/core";
import { useObservable } from "../hooks/use-observable";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { ExpenseHeaderNavigationButton } from "./ExpenseHeaderNavigationButton";
import { ExpenseHeaderTitle } from "./ExpenseHeaderTitle";
import { ExpenseHeaderActionButton } from "./ExpenseHeaderActionButton";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

export const ExpenseNavigatorHeader = () => {
    const currentExpense = useObservable(_expenseManager.currentExpense$, _expenseManager.currentExpense);
    const [actionWidth, setActionWidth] = useState<number>(40);
    const [arrowWidth, setArrowWidth] = useState<number>(40);
    const centerOffset = useSharedValue<number>(0);

    const animatedPadding = useAnimatedStyle(() => ({
        transform: [{ translateX: centerOffset.value }],
    }));

    useEffect(() => {
        centerOffset.value = withSpring((actionWidth - arrowWidth) / 2, { duration: 500 });
    }, [actionWidth, arrowWidth]);

    return (
        <SafeAreaView>
            <View style={styles.header} bg-screenBG>
                <View style={styles.arrowContainer} onLayout={(e) => setArrowWidth(e.nativeEvent.layout.width)}>
                    <ExpenseHeaderNavigationButton />
                </View>

                <Animated.View style={[styles.inputContainer, animatedPadding]}>
                    <ExpenseHeaderTitle currentExpense={currentExpense!} />
                </Animated.View>

                <View style={styles.actionContainer} onLayout={(e) => setActionWidth(e.nativeEvent.layout.width)}>
                    <ExpenseHeaderActionButton currentExpense={currentExpense!} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    arrowContainer: {
        display: "flex",
        flexDirection: "row",
        minWidth: 40,
        columnGap: 10,
        alignItems: "center",
        height: 50,
        paddingRight: 5,
    },
    actionContainer: {
        display: "flex",
        height: 50,
        minWidth: 40,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingLeft: 5,
    },
    inputContainer: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
    },
});
