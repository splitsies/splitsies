import React, { useCallback, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ContactsScreen } from "../screens/ContactsScreen";
import { useInitialize } from "../hooks/use-initialize";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { GuestScreen } from "../screens/GuestsScreen";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors, Icon, TextField } from "react-native-ui-lib";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ExpenseParamList } from "../types/params";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { useObservable } from "../hooks/use-observable";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { useThemeWatcher } from "../hooks/use-theme-watcher";

const Tab = createMaterialTopTabNavigator();
const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    BottomTabScreenProps<ExpenseParamList, "Invite">
>;

export const InviteNavigator = ({ navigation }: Props) => {
    useThemeWatcher();
    const [searchFilter, setSearchFilter] = useState<string>("");
    const state = useObservable(_inviteViewModel.mode$, _inviteViewModel.mode);

    const onBackPress = useCallback(() => {
        navigation.navigate("Items");
    }, [_expenseManager, navigation]);

    useInitialize(() => {
        void _userManager.requestUsersFromContacts();
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.screenBG }}>
            <View style={styles.header} bg-screenBG>
                <View style={styles.arrowContainer}>
                    <TouchableOpacity onPress={onBackPress}>
                        <Icon assetName="arrowBack" size={27} tintColor={Colors.textColor} />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextField
                        body
                        bg-screenBG
                        placeholder="Search"
                        placeholderTextColor={_colorConfiguration.greyFont}
                        value={searchFilter}
                        style={styles.textInput}
                        onChangeText={setSearchFilter}
                    />
                </View>

                <View style={styles.addUserContainer}>
                    <TouchableOpacity onPress={() => _inviteViewModel.setInviteMenuOpen(true)}>
                        <Icon
                            assetName={state === "contacts" ? "qrAdd" : "addUser"}
                            size={27}
                            tintColor={Colors.textColor}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <Tab.Navigator
                initialRouteName="Contacts"
                screenOptions={{
                    tabBarLabelStyle: _styleManager.typography.body,
                    tabBarIndicatorStyle: { backgroundColor: _colorConfiguration.primary },
                }}
            >
                <Tab.Screen name="Contacts" component={ContactsScreen} />
                <Tab.Screen name="Guests" component={GuestScreen} />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    addUserContainer: {
        display: "flex",
        height: 50,
        justifyContent: "center",
        paddingLeft: 5,
    },
    inputContainer: {
        display: "flex",
        flex: 1,
        height: 50,
    },
    textInput: {
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: _colorConfiguration.divider,
    },
    arrowContainer: {
        display: "flex",
        height: 50,
        justifyContent: "center",
        paddingRight: 5,
    },
});
