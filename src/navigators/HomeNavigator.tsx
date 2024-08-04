import React from "react";
import { RootDrawerContent } from "../components/RootDrawerContent";
import { ProfileScreen } from "../screens/ProfileScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { TouchableOpacity, View } from "react-native-ui-lib/core";
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet } from "react-native";
import { Button, Colors, Text } from "react-native-ui-lib";
import { SplitsiesTitle } from "../components/SplitsiesTitle";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";
import { useObservable } from "../hooks/use-observable";
import { FeedNavigator } from "./FeedNavigator";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { useInitialize } from "../hooks/use-initialize";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/params";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import Add from "../../assets/icons/add.svg";
import Menu from "../../assets/icons/menu.svg";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { SettingsScreen } from "../screens/SettingsScreen";
import Tooltip from 'react-native-walkthrough-tooltip';

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _viewModel = lazyInject<IHomeViewModel>(IHomeViewModel);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

const icon = _uiConfig.sizes.icon;

const Drawer = createDrawerNavigator();

type Props = NativeStackScreenProps<RootStackParamList, "RootScreen">;

export const HomeNavigator = SpThemedComponent(({ navigation }: Props) => {
    const pendingData = useObservable(_viewModel.pendingData$, false);

    useInitialize(() => {
        const sub = _expenseManager.currentExpense$.subscribe({
            next: (e) => {
                if (!_userManager.user) return;
                navigation.navigate(!e ? "RootScreen" : "ExpenseScreen");
            },
        });

        return () => sub.unsubscribe();
    });

    const Header = ({ navigation }: any) => {
        const onCreateExpense = async () => {
            _viewModel.setPendingData(true);
            await _expenseManager.createExpense();
            _viewModel.setPendingData(false);
        };

        const onAddPress = () => {
            Alert.alert(`Create an empty expense?`, "", [
                { text: "Yes", onPress: () => void onCreateExpense() },
                { text: "No", style: "cancel" },
            ]);
        };

        return (
            <SafeAreaView>
                <View style={styles.header} bg-screenBG>
                    <View flex row style={{ columnGap: 10 }}>
                        <SplitsiesTitle />
                    </View>
                    <View row style={{ columnGap: 10 }}>
                        <ActivityIndicator color={Colors.textColor} animating={pendingData} hidesWhenStopped />

                        
                            <TouchableOpacity onPress={onAddPress}>
                                <Add width={icon} height={icon} fill={Colors.textColor} />
                            </TouchableOpacity>

                        <TouchableOpacity onPress={navigation.openDrawer}>
                            <Menu width={icon} height={icon} fill={Colors.textColor} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    };

    return (
        <Drawer.Navigator
            initialRouteName="Home"
            drawerContent={RootDrawerContent}
            screenOptions={{
                drawerPosition: "right",
                drawerActiveTintColor: _colorConfiguration.black,
                drawerActiveBackgroundColor: Colors.primaryTranslucent,
                drawerLabelStyle: _styleManager.typography.body,
                header: Header,
            }}
        >
            <Drawer.Screen name="Home" component={FeedNavigator} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
    );
});

const styles = StyleSheet.create({
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
});
