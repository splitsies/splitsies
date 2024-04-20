import React from "react";
import { StyleSheet } from "react-native";
import { Button, Text, TouchableOpacity, View } from "react-native-ui-lib";
import { ExpensePreview } from "./ExpensePreview";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IExpenseJoinRequest } from "../models/expense-join-request/expense-join-request-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    joinRequest: IExpenseJoinRequest;
    onDeny: (joinRequest: IExpenseJoinRequest) => void;
    onApprove: (joinRequest: IExpenseJoinRequest) => void;
};

export const JoinRequest = ({ joinRequest, onDeny, onApprove }: Props): JSX.Element => {
    return (
        <View style={styles.container}>
            <Text body style={styles.label}>{`${joinRequest.requestingUser.givenName} is inviting you to join:`}</Text>
            <ExpensePreview data={joinRequest.expense} onPress={(expenseId: string) => {}} />

            <View style={styles.buttonContainer}>
                <Button
                    body
                    bg-primary
                    borderless
                    style={styles.button}
                    labelStyle={{ color: "black" }}
                    label="Deny"
                    onPress={() => onDeny(joinRequest)}
                />
                <Button
                    body
                    bg-primary
                    borderless
                    style={styles.button}
                    labelStyle={{ color: "black" }}
                    label="Approve"
                    onPress={() => onApprove(joinRequest)}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        width: "100%",
        marginBottom: 30,
    },
    buttonContainer: {
        flexDirection: "row",
        columnGap: 15,
        justifyContent: "space-between",
        alignItems: "flex-end",
        width: "100%",
        marginTop: 5,
        paddingHorizontal: 20,
        paddingBottom: 5,
    },
    label: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    button: {
        flex: 1,
    },
    border: {
        width: 1,
        backgroundColor: _colorConfiguration.greyFont,
    },
});
