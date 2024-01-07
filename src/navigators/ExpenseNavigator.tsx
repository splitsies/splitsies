import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Icon } from "react-native-ui-lib";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { StyleSheet } from "react-native";

const Tab = createBottomTabNavigator();
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);

type Props = NativeStackScreenProps<RootStackScreenParams, "ExpenseScreen">;

export const ExpenseNavigator = (_: Props) => {
    const expense = useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => e != null)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
    );

    useInitialize(() => void _expenseManager.requestUsersForExpense(expense.id));

    return (
        <Tab.Navigator
            initialRouteName="Items"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: _colorConfiguration.primary,
                tabBarLabelStyle: _styleManager.typography.subtext,
            }}
        >
            <Tab.Screen
                name="Items"
                component={ExpenseScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon assetName="receipt" tintColor={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="People"
                component={PeopleScreen}
                options={{ tabBarIcon: ({ color, size }) => <Icon assetName="people" tintColor={color} size={size} /> }}
            />
            <Tab.Screen
                name="Invite"
                component={InviteNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon assetName="addUser" tintColor={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
};
