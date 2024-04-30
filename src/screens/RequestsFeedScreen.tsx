import React, { useCallback, useState } from "react";
import { Text, View } from "react-native-ui-lib/core";
import { JoinRequest } from "../components/JoinRequest";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { FeedParamList } from "../types/params";
import { lazyInject } from "../utils/lazy-inject";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";
import { Container } from "../components/Container";
import { IExpenseJoinRequest } from "../models/expense-join-request/expense-join-request-interface";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { first, lastValueFrom, race, timer } from "rxjs";
import { IRequestConfiguration } from "../models/configuration/request-config/request-configuration-interface";

type Props = BottomTabScreenProps<FeedParamList, "Requests">;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _viewModel = lazyInject<IHomeViewModel>(IHomeViewModel);
const _requestConfiguration = lazyInject<IRequestConfiguration>(IRequestConfiguration);


export const RequestsFeedScreen = ({ route: { params: expenseId } }: Props): JSX.Element => {
    const filter = (joinRequests: IExpenseJoinRequest[]): IExpenseJoinRequest[] =>
        expenseId?.expenseId ? joinRequests.filter(j => j.expense.id === expenseId?.expenseId) : joinRequests;

    const [refreshing, setRefreshing] = useState<boolean>(false);
    const joinRequests = useObservableReducer(_expenseManager.expenseJoinRequests$, [], filter, [expenseId]);

    useFocusEffect(
        useCallback(() => {
            void onFocusAsync();
        }, []),
    );

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
        setRefreshing(true);
        await _expenseManager.requestExpenseJoinRequests();
        setRefreshing(false);
    };

    return (
        <Container style={{paddingHorizontal: 15}}>
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
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
