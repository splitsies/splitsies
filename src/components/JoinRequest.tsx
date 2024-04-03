import React from "react";
import { StyleSheet } from "react-native";
import { Text, TouchableOpacity, View } from "react-native-ui-lib";
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
                <TouchableOpacity style={styles.button} onPress={() => onDeny(joinRequest)}>
                    <Text body>Deny</Text>
                </TouchableOpacity>
                <View style={styles.border} />

                <TouchableOpacity style={[styles.button]} onPress={() => onApprove(joinRequest)}>
                    <Text body>Accept</Text>
                </TouchableOpacity>
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
        display: "flex",
        width: "100%",
        flexDirection: "row",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: _colorConfiguration.greyFont,
        marginTop: 10,
    },
    label: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    button: {
        display: "flex",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        paddingVertical: 12,
    },
    border: {
        width: 1,
        backgroundColor: _colorConfiguration.greyFont,
    },
});
