import React from "react";
import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ExpenseScreen } from "../screens/ExpenseScreen";
import { PeopleScreen } from "../screens/PeopleScreen";
import { useInitialize } from "../hooks/use-initialize";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { useObservable } from "../hooks/use-observable";
import { Observable, filter } from "rxjs";
import { IExpense } from "@splitsies/shared-models";
import { InviteNavigator } from "./InviteNavigator";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackScreenParams } from "../screens/root-stack-screen-params";

const Tab = createBottomTabNavigator();
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

type Props = NativeStackScreenProps<RootStackScreenParams, "ExpenseScreen">

export const ExpenseNavigator = (_: Props) => {
    const expense = useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => e != null)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
    );

    useInitialize(() => {
        void _expenseManager.requestUsersForExpense(expense.id);
    });
    
    return (
        <Tab.Navigator initialRouteName="Items" screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Items" component={ExpenseScreen} />
            <Tab.Screen name="People" component={PeopleScreen} />
            <Tab.Screen name="Invite" component={InviteNavigator} />
        </Tab.Navigator>
    );
}