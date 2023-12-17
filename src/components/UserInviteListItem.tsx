import React, { useCallback, useEffect, useState } from "react";
import { IExpenseJoinRequest, IExpenseUserDetails } from "@splitsies/shared-models";
import { Chip, Icon, Text, View } from "react-native-ui-lib";
import { StyleSheet } from "react-native";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IAuthProvider } from "../providers/auth-provider/auth-provider-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _authProvider = lazyInject<IAuthProvider>(IAuthProvider);

type Props = {
    user: IExpenseUserDetails;
    contactUsers: IExpenseUserDetails[];
    expenseUsers: IExpenseUserDetails[];
    pendingJoinRequests: IExpenseJoinRequest[];
    onInviteUser: (user: IExpenseUserDetails) => void;
    onUninviteUser: (user: IExpenseUserDetails) => void;
};

enum UserState {
    AvailableToInvite,
    AvailableAsGuest,
    Invited,
    Uninvitable,
    Joined,
}

export const UserInviteListItem = ({
    user,
    contactUsers,
    expenseUsers,
    pendingJoinRequests,
    onInviteUser,
    onUninviteUser,
}: Props): JSX.Element => {
    const [userState, setUserState] = useState<UserState>(UserState.AvailableAsGuest);

    useEffect(() => {
        let state = UserState.AvailableAsGuest;

        if (
            expenseUsers.map((u) => u.id).includes(user.id) ||
            expenseUsers.some((u) => u.phoneNumber === user.phoneNumber)
        ) {
            state = UserState.Joined;
        } else if (pendingJoinRequests.map((r) => r.userId).includes(user.id)) {
            state =
                pendingJoinRequests.find((r) => r.userId)?.requestingUserId === _authProvider.provideIdentity()
                    ? UserState.Uninvitable
                    : UserState.Invited;
        } else if (user.isRegistered) {
            state = UserState.AvailableToInvite;
        }

        setUserState(state);
    }, [user, pendingJoinRequests, expenseUsers]);

    const computeButtonLabel = () => {
        switch (userState) {
            case UserState.AvailableAsGuest:
                return "Add as Guest";
            case UserState.AvailableToInvite:
                return "Invite";
            case UserState.Uninvitable:
                return "Uninvite";
            case UserState.Invited:
                return "Invited";
            case UserState.Joined:
                return "";
        }
    };

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
                            disabled={userState === UserState.Invited}
                            labelStyle={[
                                styles.buttonLabel,
                                {
                                    color:
                                        userState === UserState.Invited
                                            ? _colorConfiguration.greyFont
                                            : _colorConfiguration.black,
                                },
                            ]}
                            containerStyle={{
                                width: 120,
                                borderColor:
                                    userState === UserState.Invited || userState === UserState.Uninvitable
                                        ? _colorConfiguration.primaryTranslucentLight
                                        : _colorConfiguration.primary,
                            }}
                            backgroundColor={
                                userState === UserState.Invited || userState === UserState.Uninvitable
                                    ? _colorConfiguration.primaryTranslucentLight
                                    : _colorConfiguration.primary
                            }
                            label={computeButtonLabel()}
                            onPress={() =>
                                userState === UserState.Uninvitable ? onUninviteUser(user) : onInviteUser(user)
                            }
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
