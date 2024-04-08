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

const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);

export const SearchScreen = SpThemedComponent(() => {
    const expenseUsers = useObservableReducer<IExpense | null, IExpenseUserDetails[]>(
        _expenseManager.currentExpense$,
        [],
        (e) => e?.users ?? [],
    );
    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);
    const frequentUsers = useObservable(_userManager.mostFrequent$, []);
    const [users, setUsers] = useState<IExpenseUserDetails[]>([]);
    const [fetchingPage, setFetchingPage] = useState<boolean>(false);

    useFocusEffect(() => _inviteViewModel.setMode("search"));

    const search = useCallback(
        debounce(async (search: string) => {
            if (_inviteViewModel.mode !== "search") return;
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

    const render = () => {
        console.log({ frequentUsers });
        if (users.length === 0 && frequentUsers.length !== 0 && !fetchingPage && searchFilter === "") {
            return (
                <View flex-1>
                     <View paddingL-10 paddingT-10>
                        <Text hint>Your Top {frequentUsers.length === 5 ? "5" : frequentUsers.length}</Text>
                    </View>
                    <FlatList
                        style={styles.list}
                        data={frequentUsers}
                        keyExtractor={(i) => i.id + i.phoneNumber}
                        ItemSeparatorComponent={ListSeparator}
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
                </View>
            )
        }

        if (fetchingPage || searchFilter === "" || users.length > 0) {
            return (
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
            )
        }

        return (
            <View centerH paddingT-10>
                <Text hint>No results</Text>
            </View>
        )
    }

    return (
        <Container style={styles.container}>
            <View style={styles.body}>
                {render()}
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
