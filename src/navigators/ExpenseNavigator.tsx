import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ExpenseScreen } from "../screens/ExpenseScreen";
import { PeopleScreen } from "../screens/PeopleScreen";
import { lazyInject } from "../utils/lazy-inject";
import { InviteNavigator } from "./InviteNavigator";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/params";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import Receipt from "../../assets/icons/receipt.svg";
import People from "../../assets/icons/people.svg";
import AddPerson from "../../assets/icons/add-person.svg";

const Tab = createBottomTabNavigator();
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);

type Props = NativeStackScreenProps<RootStackParamList, "ExpenseScreen">;

export const ExpenseNavigator = (_: Props) => {
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
                    tabBarIcon: ({ color, size }) => <Receipt width={size} height={size} fill={color} />,
                }}
            />
            <Tab.Screen
                name="People"
                component={PeopleScreen}
                options={{ tabBarIcon: ({ color, size }) => <People width={size} height={size} fill={color} /> }}
            />
            <Tab.Screen
                name="Invite"
                component={InviteNavigator}
                options={{ tabBarIcon: ({ color, size }) => <AddPerson width={size} height={size} fill={color} /> }}
            />
        </Tab.Navigator>
    );
};
