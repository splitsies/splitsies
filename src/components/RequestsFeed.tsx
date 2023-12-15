import { IExpenseJoinRequestDto } from "@splitsies/shared-models";
import React, { useCallback, useState } from "react";
import { Text, View } from "react-native-ui-lib/core";
import { JoinRequest } from "./JoinRequest";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

type Props = {
    joinRequests: IExpenseJoinRequestDto[];
    onDeny: (joinRequest: IExpenseJoinRequestDto) => void;
    onApprove: (joinRequest: IExpenseJoinRequestDto) => void;
    onRefresh: () => Promise<void>;
};

export const RequestsFeed = ({ joinRequests, onDeny, onApprove, onRefresh }: Props): JSX.Element => {
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const refresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    return (
        <View style={styles.scrollView}>
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
                {joinRequests.length > 0 ? (
                    joinRequests.map((r) => (
                        <JoinRequest key={r.expense.expense.id} joinRequest={r} onApprove={onApprove} onDeny={onDeny} />
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
