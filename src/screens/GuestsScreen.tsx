import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Modal, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { useObservable } from "../hooks/use-observable";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { AddGuestForm } from "../components/AddGuestForm";
import { ListSeparator } from "../components/ListSeparator";
import { UserInviteListItem } from "../components/UserInviteListItem";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, InviteParamList } from "../types/params";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { filter } from "rxjs";
import { Container } from "../components/Container";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    MaterialTopTabScreenProps<InviteParamList, "Contacts">
>;

export const GuestScreen = ({ navigation }: Props) => {
    const pendingJoinRequests = useObservable(_expenseManager.currentExpenseJoinRequests$, []);
    const expenseUsers = useObservable(_expenseManager.currentExpenseUsers$, []);
    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);
    const addGuestVisible = useObservable(
        _inviteViewModel.inviteMenuOpen$.pipe(filter((_) => _inviteViewModel.mode === "guests")),
        _inviteViewModel.inviteMenuOpen,
    );

    useFocusEffect(() => _inviteViewModel.setMode("guests"));

    const onSaveGuest = async (name: string): Promise<void> => {
        const user = await _userManager.requestAddGuestUser(name, "", "");
        await _expenseManager.requestAddUserToExpense(user.id, _expenseManager.currentExpense!.id);
        _inviteViewModel.setInviteMenuOpen(false);
    };

    return (
        <Container sytle={styles.container}>
            <View style={styles.body}>
                <FlatList
                    style={styles.list}
                    data={expenseUsers.filter(
                        (u) =>
                            !u.phoneNumber &&
                            (!searchFilter || u.givenName.toLowerCase().includes(searchFilter.toLowerCase())),
                    )}
                    keyExtractor={(i) => i.id + i.phoneNumber}
                    ItemSeparatorComponent={ListSeparator}
                    renderItem={({ item: user }) => (
                        <UserInviteListItem
                            user={user}
                            expenseUsers={expenseUsers}
                            pendingJoinRequests={pendingJoinRequests}
                            onInviteUser={() => {}}
                            onUninviteUser={() => {}}
                        />
                    )}
                />
            </View>

            <Modal enableModalBlur visible={addGuestVisible} animationType="slide">
                <AddGuestForm onSave={onSaveGuest} onCancel={() => _inviteViewModel.setInviteMenuOpen(false)} />
            </Modal>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        rowGap: 10,
        alignItems: "center",
        height: "100%",
        paddingTop: 10,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    body: {
        display: "flex",
        flexGrow: 1,
        flex: 1,
        width: "100%",
    },
    arrowContainer: {
        display: "flex",
        height: 50,
        justifyContent: "center",
        paddingRight: 5,
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
        backgroundColor: "white",
        borderRadius: 25,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: _colorConfiguration.divider,
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
});
