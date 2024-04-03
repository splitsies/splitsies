import React, { useCallback, useState } from "react";
import { Text, View } from "react-native-ui-lib/core";
import { JoinRequest } from "../components/JoinRequest";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { RootStackParamList, DrawerParamList, FeedParamList } from "../types/params";
import { lazyInject } from "../utils/lazy-inject";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";
import { useObservable } from "../hooks/use-observable";
import { Container } from "../components/Container";
import { IExpenseJoinRequest } from "../models/expense-join-request/expense-join-request-interface";

type Props = CompositeScreenProps<
    CompositeScreenProps<NativeStackScreenProps<RootStackParamList>, DrawerScreenProps<DrawerParamList, "Home">>,
    BottomTabScreenProps<FeedParamList, "Requests">
>;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _viewModel = lazyInject<IHomeViewModel>(IHomeViewModel);

export const RequestsFeedScreen = (_: Props): JSX.Element => {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const joinRequests = useObservable(_expenseManager.expenseJoinRequests$, []);

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
        <Container>
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
