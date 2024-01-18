import React, { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { useObservable } from "../hooks/use-observable";
import { IQrPayload } from "../models/qr-payload/qr-payload-interface";
import { Code } from "react-native-vision-camera";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { IImageConfiguration } from "../models/configuration/image-config/image-configuration-interface";
import { ListSeparator } from "../components/ListSeparator";
import { UserInviteListItem } from "../components/UserInviteListItem";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { useFocusEffect } from "@react-navigation/native";
import { ScanUserModal } from "../components/ScanUserModal";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { filter } from "rxjs";
import { Container } from "../components/Container";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _imageConfiguration = lazyInject<IImageConfiguration>(IImageConfiguration);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);

let timeoutId: NodeJS.Timeout;
export const ContactsScreen = SpThemedComponent(() => {

    const contactUsers = useObservable(_userManager.contactUsers$, []);
    const pendingJoinRequests = useObservable(_expenseManager.currentExpenseJoinRequests$, []);
    const expenseUsers = useObservable(_expenseManager.currentExpenseUsers$, []);
    const codeScannerVisible = useObservable(
        _inviteViewModel.inviteMenuOpen$.pipe(filter((_) => _inviteViewModel.mode === "contacts")),
        _inviteViewModel.inviteMenuOpen,
    );
    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);
    const [scannedUser, setScannedUser] = useState<IQrPayload | null>(null);

    useFocusEffect(() => _inviteViewModel.setMode("contacts"));

    const onUserInvited = async (user: IExpenseUserDetails): Promise<void> => {
        if (!user.isRegistered || !user.id) {
            return;
        }
        return _expenseManager.sendExpenseJoinRequest(user.id, _expenseManager.currentExpense!.id);
    };

    const onUserUninvited = async (user: IExpenseUserDetails): Promise<void> => {
        return _expenseManager.removeExpenseJoinRequestForUser(_expenseManager.currentExpense!.id, user.id);
    };

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
        console.log({ payload, now: Date.now() });
        setScannedUser(payload);
    };

    return (
        <Container style={styles.container}>
            <View style={styles.body}>
                <FlatList
                    style={styles.list}
                    data={contactUsers.filter(
                        (u) =>
                            !searchFilter ||
                            `${u.givenName} ${u.familyName}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            u.phoneNumber.includes(searchFilter),
                    )}
                    keyExtractor={(i) => i.id + i.phoneNumber}
                    ItemSeparatorComponent={ListSeparator}
                    renderItem={({ item: user }) => (
                        <UserInviteListItem
                            user={user}
                            expenseUsers={expenseUsers}
                            pendingJoinRequests={pendingJoinRequests}
                            onInviteUser={() => onUserInvited(user)}
                            onUninviteUser={() => onUserUninvited(user)}
                        />
                    )}
                />
            </View>

            <ScanUserModal
                visible={codeScannerVisible}
                setVisible={(val) => _inviteViewModel.setInviteMenuOpen(val)}
                scannedUser={scannedUser}
                onScannedUserAdded={onScannedUserAdded}
                onCodeScanned={onCodeScanned}
                shouldDisableChip={expenseUsers.some((e) => e.id === scannedUser?.id)}
            />
        </Container>
    );
});

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        rowGap: 10,
        alignItems: "center",
        height: "100%",
        paddingTop: 10,
    },
    body: {
        display: "flex",
        flexGrow: 1,
        flex: 1,
        width: "100%",
    },
    list: {
        width: "100%",
        paddingHorizontal: 10,
    },
    buttonLabel: {
        fontSize: 14,
        lineHeight: 27,
        fontFamily: "Avenir-Roman",
    },
    cameraOverlay: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 20,
    },
});
