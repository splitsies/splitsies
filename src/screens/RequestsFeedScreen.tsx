import React, { useState } from "react";
import { IExpenseJoinRequestDto } from "@splitsies/shared-models";
import { Text, View } from "react-native-ui-lib/core";
import { JoinRequest } from "../components/JoinRequest";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { RootStackScreenParams, DrawerParamList, FeedParamList } from "./root-stack-screen-params";
import { lazyInject } from "../utils/lazy-inject";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";
import { useObservable } from "../hooks/use-observable";

type Props = CompositeScreenProps<
    CompositeScreenProps<NativeStackScreenProps<RootStackScreenParams>, DrawerScreenProps<DrawerParamList, "Home">>,
    BottomTabScreenProps<FeedParamList, "Requests">
>;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _viewModel = lazyInject<IHomeViewModel>(IHomeViewModel);

export const RequestsFeedScreen = (_: Props): JSX.Element => {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const joinRequests = useObservable(_expenseManager.expenseJoinRequests$, []);

    useFocusEffect(() => {
        _viewModel.setPendingData(true);
        void _expenseManager.requestExpenseJoinRequests();
        _viewModel.setPendingData(false);
    });

    const onApproveRequest = async (joinRequest: IExpenseJoinRequestDto): Promise<void> => {
        await _expenseManager.requestAddUserToExpense(joinRequest.userId, joinRequest.expense.expense.id);
        await _expenseManager.removeExpenseJoinRequestForUser(joinRequest.expense.expense.id);
    };

    const onDenyRequest = async (joinRequest: IExpenseJoinRequestDto): Promise<void> => {
        await _expenseManager.removeExpenseJoinRequestForUser(joinRequest.expense.expense.id);
    };
    const refresh = async () => {
        setRefreshing(true);
        await _expenseManager.requestExpenseJoinRequests();
        setRefreshing(false);
    };

    return (
        <View style={styles.scrollView}>
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
                {joinRequests.length > 0 ? (
                    joinRequests.map((r) => (
                        <JoinRequest
                            key={r.expense.expense.id}
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
        </View>
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
