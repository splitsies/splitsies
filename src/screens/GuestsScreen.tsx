import React, { useCallback } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Modal, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { useObservable } from "../hooks/use-observable";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { AddGuestForm } from "../components/AddGuestForm";
import { ListSeparator } from "../components/ListSeparator";
import { UserInviteListItem } from "../components/UserInviteListItem";
import { useFocusEffect } from "@react-navigation/native";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { filter } from "rxjs";
import { Container } from "../components/Container";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);

export const GuestScreen = SpThemedComponent(() => {
    const expenseUsers = useObservableReducer<IExpense | null, IExpenseUserDetails[]>(
        _expenseManager.currentExpense$,
        [],
        (e) => e?.users ?? [],
    );
    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);
    const addGuestVisible = useObservable(
        _inviteViewModel.inviteMenuOpen$.pipe(filter((_) => _inviteViewModel.mode === "guests")),
        _inviteViewModel.inviteMenuOpen,
    );

    useFocusEffect(useCallback(() => {
        _inviteViewModel.setMode("guests");
        _expenseViewModel.setScreen("Guests");
    }, []));

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
                            onInviteUser={() => {}}
                            onUninviteUser={() => {}}
                        />
                    )}
                />
            </View>

            <Modal enableModalBlur visible={addGuestVisible} transparent animationType="fade">
                <AddGuestForm onSave={onSaveGuest} onCancel={() => _inviteViewModel.setInviteMenuOpen(false)} />
            </Modal>
        </Container>
    );
});

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        rowGap: 10,
        alignItems: "center",
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
