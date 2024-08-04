import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Text, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { useObservable } from "../hooks/use-observable";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { ListSeparator } from "../components/ListSeparator";
import { UserInviteListItem } from "../components/UserInviteListItem";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { useFocusEffect } from "@react-navigation/native";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { Container } from "../components/Container";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { debounce } from "../utils/debounce";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { TutorialTip } from "../components/TutorialTip";

const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);

export const SearchScreen = SpThemedComponent(() => {
    const expenseUsers = useObservableReducer<IExpense | null, IExpenseUserDetails[]>(
        _expenseManager.currentExpense$,
        [],
        (e) => e?.users ?? [],
    );
    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);
    const [users, setUsers] = useState<IExpenseUserDetails[]>([]);
    const [fetchingPage, setFetchingPage] = useState<boolean>(false);

    useFocusEffect(
        useCallback(() => {
            _inviteViewModel.setMode("search");
            _expenseViewModel.setScreen("Search");
            search(searchFilter);
        }, []),
    );

    const search = useCallback(
        debounce(async (search: string) => {
            if (_inviteViewModel.mode !== "search" || !search) return;
            setUsers(await _userManager.requestFindUsers(search, true));
            setFetchingPage(false);
        }, 500),
        [],
    );

    const fetchPage = async (): Promise<void> => {
        if (fetchingPage) return;

        setFetchingPage(true);
        const newList = [
            ...users,
            ...(await _userManager.requestFindUsers(searchFilter, false)).filter(
                (u) => !users.find((us) => us.id === u.id),
            ),
        ];
        setUsers(newList);
        setFetchingPage(false);
    };

    useEffect(() => {
        setFetchingPage(true);
        search(searchFilter);
    }, [searchFilter]);

    const onUserInvited = async (user: IExpenseUserDetails): Promise<void> => {
        if (!user.isRegistered || !user.id) {
            return;
        }
        return _expenseManager.sendExpenseJoinRequest(user.id, _expenseManager.currentExpense!.id);
    };

    const onUserUninvited = async (user: IExpenseUserDetails): Promise<void> => {
        return _expenseManager.removeExpenseJoinRequestForUser(_expenseManager.currentExpense!.id, user.id);
    };

    return (
        <Container style={styles.container}>
            <TutorialTip group="search" stepKey="search" />
            <View style={styles.body}>
                {fetchingPage || searchFilter === "" || users.length > 0 ? (
                    <FlatList
                        style={styles.list}
                        data={users}
                        keyExtractor={(i) => i.id + i.phoneNumber}
                        ItemSeparatorComponent={ListSeparator}
                        onEndReached={(_) => void fetchPage()}
                        renderItem={({ item: user }) => (
                            <UserInviteListItem
                                user={user}
                                expenseUsers={expenseUsers}
                                onInviteUser={() => onUserInvited(user)}
                                onUninviteUser={() => onUserUninvited(user)}
                                showUsername
                            />
                        )}
                    />
                ) : (
                    <View centerH paddingT-10>
                        <Text hint>No results</Text>
                    </View>
                )}
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
