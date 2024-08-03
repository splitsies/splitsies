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
import { useInitialize } from "../hooks/use-initialize";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { ExpenseNavigationHeader } from "../components/ExpenseNavigatorHeader";
import Receipt from "../../assets/icons/receipt.svg";
import People from "../../assets/icons/people.svg";
import AddPerson from "../../assets/icons/add-person.svg";
import ShareIcon from "../../assets/icons/share.svg";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { Pressable, Share } from "react-native";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);

type Props = NativeStackScreenProps<RootStackParamList, "ExpenseScreen">;

export const ExpenseNavigator = SpThemedComponent(() => {
    return (
        <Drawer.Navigator screenOptions={{ header: ExpenseNavigationHeader, swipeEnabled: false }}>
            <Drawer.Screen name="Expense" component={InternalExpenseNavigator} />
        </Drawer.Navigator>
    );
});

/**
 * See https://github.com/react-navigation/react-navigation/issues/11353
 * There is an issue where the layouts will flicker on initial load.
 * Wrapping this in a drawer navigator seems to be a bandaid for the issue
 */
const InternalExpenseNavigator = SpThemedComponent((_: Props) => {
    useInitialize(() => {
        void _userManager.requestUsersFromContacts();
        return () => {
            _expenseViewModel.resetState();
            _expenseManager.disconnectFromExpense();
        };
    });

    const onShare = async () => {
        await Share.share(
            {
                message: `Hello! Let's go Splitsies.`,
                url: `splitsies://expenses/${_expenseManager.currentExpense?.id}/${_userManager.userId}`,
                title: "Share",
            },
            {
                dialogTitle: "Share to...",
            },
        );
    };

    return (
        <Tab.Navigator
            initialRouteName="Items"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: _colorConfiguration.primary,
                tabBarLabelStyle: { ..._styleManager.typography.subtext },
                tabBarStyle: { paddingTop: 3 },
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
                options={{
                    lazy: false,
                    tabBarIcon: ({ color, size }) => <People width={size} height={size} fill={color} />,
                }}
            />
            <Tab.Screen
                name="Invite"
                component={InviteNavigator}
                options={{
                    lazy: false,
                    tabBarIcon: ({ color, size }) => <AddPerson width={size} height={size} fill={color} />,
                }}
            />
            <Tab.Screen
                name="Share"
                component={ExpenseNavigationHeader}
                options={{
                    tabBarButton: (props) => <Pressable {...props} onPress={onShare} />,
                    tabBarIcon: ({ color, size }) => <ShareIcon width={size} height={size} fill={color} />,
                }}
            />
        </Tab.Navigator>
    );
});
