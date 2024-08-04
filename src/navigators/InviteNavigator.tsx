import React, { useCallback, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ContactsScreen } from "../screens/ContactsScreen";
import { lazyInject } from "../utils/lazy-inject";
import { GuestScreen } from "../screens/GuestsScreen";
import { SafeAreaView, View } from "react-native";
import { Colors } from "react-native-ui-lib";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ExpenseParamList } from "../types/params";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { useObservable } from "../hooks/use-observable";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { SearchScreen } from "../screens/SearchScreen";
import { filter } from "rxjs";
import { ScanUserModal } from "../components/ScanUserModal";
import { IQrPayload } from "../models/qr-payload/qr-payload-interface";
import { IImageConfiguration } from "../models/configuration/image-config/image-configuration-interface";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

const Tab = createMaterialTopTabNavigator();
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _imageConfiguration = lazyInject<IImageConfiguration>(IImageConfiguration);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    BottomTabScreenProps<ExpenseParamList, "Invite">
>;

let timeoutId: NodeJS.Timeout;

export const InviteNavigator = SpThemedComponent(({ navigation }: Props) => {
    const expenseUsers = useObservableReducer<IExpense | null, IExpenseUserDetails[]>(
        _expenseManager.currentExpense$,
        _expenseManager.currentExpense?.users ?? [],
        (e) => e?.users ?? [],
    );

    const codeScannerVisible = useObservable(
        _inviteViewModel.inviteMenuOpen$.pipe(filter((_) => _inviteViewModel.mode !== "guests")),
        _inviteViewModel.inviteMenuOpen,
    );

    const [scannedUser, setScannedUser] = useState<IQrPayload | null>(null);

    useFocusEffect(
        useCallback(() => {
            _expenseViewModel.onBackPress = onBackPress;
        }, []),
    );

    const onBackPress = useCallback(() => {
        navigation.navigate("Items");
    }, [_expenseManager, navigation]);

    const onScannedUserAdded = () => {
        if (!scannedUser || !_expenseManager.currentExpense) return;
        _expenseManager.requestAddUserToExpense(scannedUser.id, _expenseManager.currentExpense.id);
    };

    const onCodeScanned = (event: any): void => {
        let payload = null;

        try {
            const parsed = JSON.parse(event.nativeEvent.codeStringValue ?? "") as IQrPayload;
            if (!parsed.id) {
                return;
            }
            payload = parsed;
        } catch {
            return;
        }

        if (!payload || (scannedUser && payload.id === scannedUser.id)) return;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setScannedUser(null), _imageConfiguration.qrCodeTimeoutMs);
        setScannedUser(payload);
    };

    return (
        <SafeAreaView style={{ display: "flex", flex: 1, flexGrow: 1, backgroundColor: Colors.screenBG }}>
            <View style={{ flex: 1 }}>
                <Tab.Navigator
                    initialRouteName="Contacts"
                    screenOptions={{
                        tabBarLabelStyle: _styleManager.typography.body,
                        tabBarIndicatorStyle: { backgroundColor: _colorConfiguration.primary },
                    }}
                >
                    <Tab.Screen name="Contacts" component={ContactsScreen} options={{ lazy: true }} />
                    <Tab.Screen name="Guests" component={GuestScreen} options={{ lazy: true }} />
                    <Tab.Screen name="Search" component={SearchScreen} options={{ lazy: true }} />
                </Tab.Navigator>
            </View>

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
});
