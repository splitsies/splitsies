import React, { lazy, useCallback, useState } from "react";
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

import ArrowBack from "../../assets/icons/arrow-back.svg";
import QrAdd from "../../assets/icons/qr-add.svg";
import AddPerson from "../../assets/icons/add-person.svg";

import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { SearchScreen } from "../screens/SearchScreen";
import { Code } from "react-native-vision-camera";
import { filter } from "rxjs";
import { ScanUserModal } from "../components/ScanUserModal";
import { IQrPayload } from "../models/qr-payload/qr-payload-interface";
import { IImageConfiguration } from "../models/configuration/image-config/image-configuration-interface";

const Tab = createMaterialTopTabNavigator();
const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _imageConfiguration = lazyInject<IImageConfiguration>(IImageConfiguration);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    BottomTabScreenProps<ExpenseParamList, "Invite">
>;

let timeoutId: NodeJS.Timeout;

export const InviteNavigator = ({ navigation }: Props) => {
    useThemeWatcher();
    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);
    const state = useObservable(_inviteViewModel.mode$, _inviteViewModel.mode);
    const expenseUsers = useObservable(_expenseManager.currentExpenseUsers$, []);
    const codeScannerVisible = useObservable(
        _inviteViewModel.inviteMenuOpen$.pipe(filter((_) => _inviteViewModel.mode !== "guests")),
        _inviteViewModel.inviteMenuOpen,
    );

    const [scannedUser, setScannedUser] = useState<IQrPayload | null>(null);

    const onBackPress = useCallback(() => {
        navigation.navigate("Items");
    }, [_expenseManager, navigation]);

    useInitialize(() => {
        void _userManager.requestUsersFromContacts();
    });

    const onScannedUserAdded = () => {
        if (!scannedUser || !_expenseManager.currentExpense) return;
        _expenseManager.requestAddUserToExpense(scannedUser.id, _expenseManager.currentExpense.id);
    };

    const onCodeScanned = (codes: Code[]): void => {
        const rawPayload = codes.find((c) => {
            try {
                const parsed = JSON.parse(c.value ?? "") as IQrPayload;
                return parsed.id !== undefined && parsed.familyName !== undefined && parsed.givenName !== undefined;
            } catch {
                return false;
            }
        });

        if (!rawPayload?.value || (scannedUser && rawPayload.value === JSON.stringify(scannedUser))) return;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setScannedUser(null), _imageConfiguration.qrCodeTimeoutMs);
        const payload = JSON.parse(rawPayload.value) as IQrPayload;
        setScannedUser(payload);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.screenBG }}>
            <View style={styles.header} bg-screenBG>
                <View style={styles.arrowContainer}>
                    <TouchableOpacity onPress={onBackPress}>
                        <ArrowBack height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextField
                        body
                        autoCapitalize="none"
                        bg-screenBG
                        placeholder="Search"
                        placeholderTextColor={_colorConfiguration.greyFont}
                        value={searchFilter}
                        style={styles.textInput}
                        onChangeText={(text) => _inviteViewModel.setSearchFilter(text)}
                    />
                </View>

                <View style={styles.addUserContainer}>
                    <TouchableOpacity onPress={() => _inviteViewModel.setInviteMenuOpen(true)}>
                        {state === "guests" ? (
                            <AddPerson
                                height={_uiConfig.sizes.icon}
                                width={_uiConfig.sizes.icon}
                                fill={Colors.textColor}
                            />
                        ) : (
                            <QrAdd height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
                        )}
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
                <Tab.Screen name="Search" component={SearchScreen} />
            </Tab.Navigator>

            <ScanUserModal
                visible={codeScannerVisible}
                setVisible={(val: boolean) => _inviteViewModel.setInviteMenuOpen(val)}
                scannedUser={scannedUser}
                onScannedUserAdded={onScannedUserAdded}
                onCodeScanned={onCodeScanned}
                shouldDisableChip={expenseUsers.some((e) => e.id === scannedUser?.id)}
            />
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
