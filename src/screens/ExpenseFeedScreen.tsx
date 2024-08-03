import React, { useEffect, useRef, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { Colors, Text, View } from "react-native-ui-lib";
import { ListSeparator } from "../components/ListSeparator";
import { ExpensePreview } from "../components/ExpensePreview";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FeedParamList, RootStackParamList } from "../types/params";
import { CompositeScreenProps } from "@react-navigation/native";
import { race, first, timer, lastValueFrom } from "rxjs";
import { useObservable } from "../hooks/use-observable";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IRequestConfiguration } from "../models/configuration/request-config/request-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { Container } from "../components/Container";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = CompositeScreenProps<
    BottomTabScreenProps<FeedParamList, "Feed">,
    NativeStackScreenProps<RootStackParamList>
>;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _requestConfiguration = lazyInject<IRequestConfiguration>(IRequestConfiguration);
const _viewModel = lazyInject<IHomeViewModel>(IHomeViewModel);

export const ExpenseFeedScreen = SpThemedComponent(({ navigation, route }: Props): JSX.Element => {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const expenses = useObservable(_expenseManager.expenses$, _expenseManager.expenses);
    const userName = useObservableReducer(_userManager.user$, "", (userCred) => userCred?.user.givenName ?? "");
    const [fetchingPage, setFetchingPage] = useState<boolean>(false);
    const pendingConnection = useRef<boolean>(false);

    useEffect(() => {
        void onLoad();
    }, [route]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("blur", () => {
            navigation.setParams({});
        });

        return unsubscribe;
    }, [navigation]);

    const onLoad = async (): Promise<void> => {
        if (route.params?.expenseId && route.params?.requestingUserId && _userManager.userId) {
            await _expenseManager.requestAddUserToExpense(
                _userManager.userId,
                route.params.expenseId!,
                route.params.requestingUserId,
            );
            await onExpenseClick(route.params.expenseId);
        }

        void fetchExpenses();
    };

    const fetchExpenses = async (): Promise<void> => {
        _viewModel.setPendingData(true);
        await _expenseManager.requestForUser();
        _viewModel.setPendingData(false);
    };

    const onExpenseClick = async (expenseId: string) => {
        if (pendingConnection.current) return;
        pendingConnection.current = true;
        _viewModel.setPendingData(true);
        void _expenseManager.connectToExpense(expenseId);

        const timedExpenseObserver = race(
            _expenseManager.currentExpense$.pipe(first((e) => !!e)),
            timer(_requestConfiguration.connectionTimeoutMs),
        );

        await lastValueFrom(timedExpenseObserver);
        _viewModel.setPendingData(false);
        pendingConnection.current = false;
    };

    const refresh = async (): Promise<void> => {
        setRefreshing(true);
        await _expenseManager.requestForUser();
        setRefreshing(false);
    };

    const fetchPage = async (): Promise<void> => {
        if (fetchingPage) return;
        setFetchingPage(true);
        await _expenseManager.requestForUser(false);
        setFetchingPage(false);
    };

    return expenses.length === 0 ? (
        <Container>
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
                <View style={styles.messageBox}>
                    <Text subheading color={Colors.textColor}>
                        Welcome, {userName}!
                    </Text>
                </View>
            </ScrollView>
            <View style={styles.hintBox}>
                <Text hint>Tap to scan a receipt</Text>
            </View>
        </Container>
    ) : (
        <Container>
            {_userManager.user && (
                <FlatList
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
                    onEndReached={(_) => void fetchPage()}
                    ItemSeparatorComponent={ListSeparator}
                    renderItem={({ item }) => (
                        <ExpensePreview
                            key={item.id}
                            data={item}
                            onPress={onExpenseClick}
                            person={_userManager.expenseUserDetails}
                            onLongPress={() => console.log("LONG")}
                        />
                    )}
                    data={expenses}
                />
            )}
        </Container>
    );
});

const styles = StyleSheet.create({
    messageBox: {
        display: "flex",
        width: "100%",
        alignItems: "center",
        flex: 2,
        justifyContent: "center",
    },
    hintBox: {
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 60,
    },
});
