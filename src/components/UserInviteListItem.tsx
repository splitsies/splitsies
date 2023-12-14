import React, { useCallback } from "react";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { Chip, Icon, Text, View } from "react-native-ui-lib";
import { StyleSheet } from "react-native";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    user: IExpenseUserDetails;
    contactUsers: IExpenseUserDetails[];
    expenseUsers: IExpenseUserDetails[];
    pendingUserIds: string[];
    onInviteUser: (user: IExpenseUserDetails) => void;
};

export const UserInviteListItem = ({
    user,
    contactUsers,
    expenseUsers,
    pendingUserIds,
    onInviteUser,
}: Props): JSX.Element => {
    const computeButtonLabel = useCallback(
        (user: IExpenseUserDetails) => {
            if (expenseUsers.map((u) => u.id).includes(user.id)) return "";
            if (pendingUserIds.includes(user.id)) return "Invited";
            if (user.isRegistered) return "Invite";
            return "Add as Guest";
        },
        [expenseUsers, contactUsers, pendingUserIds],
    );

    return (
        <View style={styles.itemContainer}>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    {user.id && <Icon assetName={user.isRegistered ? "logoPrimary" : "logoGrey"} size={35} />}
                </View>

                <View style={styles.nameContainer}>
                    <Text body numberOfLines={1} ellipsizeMode={"tail"}>
                        {user.givenName + " " + user.familyName}
                    </Text>
                    <Text hint>{user.phoneNumber || "Guest"}</Text>
                </View>

                <View style={styles.buttonContainer}>
                    {!expenseUsers.map((u) => u.id).includes(user.id) && !!user.phoneNumber && (
                        <Chip
                            activeOpacity={0.5}
                            disabled={pendingUserIds.includes(user.id)}
                            labelStyle={[
                                styles.buttonLabel,
                                {
                                    color: pendingUserIds.includes(user.id)
                                        ? _colorConfiguration.greyFont
                                        : _colorConfiguration.black,
                                },
                            ]}
                            containerStyle={{
                                width: 120,
                                borderColor: pendingUserIds.includes(user.id)
                                    ? _colorConfiguration.primaryTranslucentLight
                                    : _colorConfiguration.primary,
                            }}
                            backgroundColor={
                                pendingUserIds.includes(user.id)
                                    ? _colorConfiguration.primaryTranslucentLight
                                    : _colorConfiguration.primary
                            }
                            label={computeButtonLabel(user)}
                            onPress={() => onInviteUser(user)}
                        />
                    )}

                    {expenseUsers.map((u) => u.id).includes(user.id) && (
                        <Icon assetName="checkCircle" size={30} tintColor={_colorConfiguration.primary} />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginVertical: 10,
    },
    container: {
        display: "flex",
        flexDirection: "row",
        flexGrow: 1,
        justifyContent: "space-between",
        marginRight: 10,
    },
    nameContainer: {
        display: "flex",
        flex: 1,
    },
    logoContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: 50,
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    buttonLabel: {
        fontSize: 14,
        lineHeight: 27,
        fontFamily: "Avenir-Roman",
    },
});
