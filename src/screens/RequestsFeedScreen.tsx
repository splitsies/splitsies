import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native-ui-lib/core";
import { JoinRequest } from "../components/JoinRequest";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { DrawerParamList, FeedParamList, RootStackParamList } from "../types/params";
import { lazyInject } from "../utils/lazy-inject";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";
import { Container } from "../components/Container";
import { IExpenseJoinRequest } from "../models/expense-join-request/expense-join-request-interface";
import { first, lastValueFrom, race, timer } from "rxjs";
import { IRequestConfiguration } from "../models/configuration/request-config/request-configuration-interface";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useObservable } from "../hooks/use-observable";

type Props = CompositeScreenProps<
    CompositeScreenProps<NativeStackScreenProps<RootStackParamList>, DrawerScreenProps<DrawerParamList, "Home">>,
    BottomTabScreenProps<FeedParamList, "Requests">
>;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _viewModel = lazyInject<IHomeViewModel>(IHomeViewModel);
const _requestConfiguration = lazyInject<IRequestConfiguration>(IRequestConfiguration);

export const RequestsFeedScreen = ({ navigation }: Props): JSX.Element => {
    const requestFilter = useObservable(_viewModel.requestFilter$, _viewModel.requestFilter);
    const allJoinRequests = useObservable(_expenseManager.expenseJoinRequests$, []);
    const [joinRequests, setJoinRequests] = useState<IExpenseJoinRequest[]>(allJoinRequests);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    useFocusEffect(
        useCallback(() => {
            void onFocusAsync();
        }, []),
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener("blur", () => {
            _viewModel.setRequestFilter("");
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        const requests = requestFilter
            ? [...allJoinRequests.filter((j) => j.expense.id === requestFilter)]
            : [...allJoinRequests];
        setJoinRequests(requests);
    }, [allJoinRequests, requestFilter]);

    const onFocusAsync = async (): Promise<void> => {
        _viewModel.setPendingData(true);
        await _expenseManager.requestExpenseJoinRequests();
        _viewModel.setPendingData(false);
    };

    const onApproveRequest = async (joinRequest: IExpenseJoinRequest): Promise<void> => {
        await _expenseManager.removeExpenseJoinRequestForUser(joinRequest.expense.id);

        _viewModel.setPendingData(true);
        void _expenseManager.connectToExpense(joinRequest.expense.id);

        const timedExpenseObserver = race(
            _expenseManager.currentExpense$.pipe(first((e) => !!e)),
            timer(_requestConfiguration.connectionTimeoutMs),
        );

        await lastValueFrom(timedExpenseObserver);
        _viewModel.setPendingData(false);
    };

    const onDenyRequest = async (joinRequest: IExpenseJoinRequest): Promise<void> => {
        await _expenseManager.requestRemoveUserFromExpense(joinRequest.userId, joinRequest.expense.id);
        void _expenseManager.requestExpenseJoinRequests();
    };

    const refresh = async () => {
        _viewModel.setRequestFilter("");
        setRefreshing(true);
        await _expenseManager.requestExpenseJoinRequests();
        setRefreshing(false);
    };

    return (
        <Container>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
                style={{ paddingHorizontal: 15 }}
            >
                {joinRequests.length > 0 ? (
                    joinRequests.map((r) => (
                        <JoinRequest
                            key={r.expense.id}
                            joinRequest={r}
                            onApprove={onApproveRequest}
                            onDeny={onDenyRequest}
                        />
                    ))
                ) : (
                    <View style={styles.messageContainer}>
                        <Text hint>Doesn't look like there are any requests here</Text>
                    </View>
                )}
            </ScrollView>
        </Container>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        display: "flex",
        flexGrow: 1,
    },
    messageContainer: {
        display: "flex",
        flexGrow: 1,
        alignItems: "center",
    },
});
