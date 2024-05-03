import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { useObservable } from "../hooks/use-observable";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { ListSeparator } from "../components/ListSeparator";
import { UserInviteListItem } from "../components/UserInviteListItem";
import { IExpenseUserDetails, IUserDto } from "@splitsies/shared-models";
import { useFocusEffect } from "@react-navigation/native";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { Container } from "../components/Container";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";

const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);

export const ContactsScreen = SpThemedComponent(() => {
    const contactUsers = useObservable(_userManager.contactUsers$, []);
    const expenseUsers = useObservableReducer<IExpense | null, IExpenseUserDetails[]>(
        _expenseManager.currentExpense$,
        [],
        (e) => e?.users ?? [],
    );

    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);

    useFocusEffect(() => {
        _inviteViewModel.setMode("contacts");
        _expenseViewModel.setScreen("Contacts");
    });

    const onUserInvited = async (user: IExpenseUserDetails): Promise<void> => {
        if (!user.isRegistered) {
            let userId = user.id;
            if (!user.id) {
                const createdGuest = await _userManager.requestAddGuestUser(
                    user.givenName,
                    user.familyName,
                    user.phoneNumber,
                );
                if (!createdGuest) return;
                userId = createdGuest.id;
            }

            return _expenseManager.requestAddUserToExpense(userId, _expenseManager.currentExpense!.id);
        }

        return _expenseManager.sendExpenseJoinRequest(user.id, _expenseManager.currentExpense!.id);
    };

    const onUserUninvited = async (user: IExpenseUserDetails): Promise<void> => {
        return _expenseManager.removeExpenseJoinRequestForUser(_expenseManager.currentExpense!.id, user.id);
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
                            u.phoneNumber?.includes(searchFilter),
                    )}
                    keyExtractor={(i) => i.id + i.phoneNumber}
                    ItemSeparatorComponent={ListSeparator}
                    renderItem={({ item: user }) => (
                        <UserInviteListItem
                            user={user}
                            expenseUsers={expenseUsers}
                            onInviteUser={() => onUserInvited(user)}
                            onUninviteUser={() => onUserUninvited(user)}
                        />
                    )}
                />
            </View>
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
