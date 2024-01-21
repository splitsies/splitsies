import React, { useEffect, useState } from "react";
import { IExpenseJoinRequest, IExpenseUserDetails } from "@splitsies/shared-models";
import { Chip, Colors, Icon, Text, View } from "react-native-ui-lib";
import { ActivityIndicator, StyleSheet } from "react-native";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IAuthProvider } from "../providers/auth-provider/auth-provider-interface";
import { useThemeWatcher } from "../hooks/use-theme-watcher";
import CheckCircle from "../../assets/icons/check-circle.svg";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _authProvider = lazyInject<IAuthProvider>(IAuthProvider);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = {
    user: IExpenseUserDetails;
    expenseUsers: IExpenseUserDetails[];
    pendingJoinRequests: IExpenseJoinRequest[];
    showUsername?: boolean;
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
    expenseUsers,
    pendingJoinRequests,
    showUsername,
    onInviteUser,
    onUninviteUser,
}: Props): JSX.Element => {
    useThemeWatcher();
    const [userState, setUserState] = useState<UserState>(UserState.AvailableAsGuest);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    useEffect(() => {
        let state = UserState.AvailableAsGuest;

        setAwaitingResponse(false);

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

    const onChipPress = () => {
        if (userState === UserState.Uninvitable) {
            onUninviteUser(user);
        } else {
            onInviteUser(user);
        }

        setAwaitingResponse(true);
    };

    return (
        <View style={styles.itemContainer}>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    {user.id && <Icon assetName={user.isRegistered ? "logoPrimary" : "logoGrey"} size={27} />}
                </View>

                <View style={styles.nameContainer}>
                    <Text body numberOfLines={1} ellipsizeMode={"tail"} color={Colors.textColor}>
                        {user.givenName + " " + user.familyName}
                    </Text>
                    {showUsername ? (
                        <Text hint>@{user.username}</Text>
                    ) : (
                        <Text hint>{user.phoneNumber || "Guest"}</Text>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <ActivityIndicator animating={awaitingResponse} hidesWhenStopped color={Colors.textColor} />
                    {!expenseUsers.map((u) => u.id).includes(user.id) && !!user.phoneNumber && (
                        <Chip
                            activeOpacity={0.5}
                            disabled={userState === UserState.Invited || awaitingResponse}
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
                                minWidth: 120,
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
                            onPress={onChipPress}
                        />
                    )}

                    {expenseUsers.map((u) => u.id).includes(user.id) && (
                        <CheckCircle
                            width={_uiConfig.sizes.icon}
                            height={_uiConfig.sizes.icon}
                            fill={_colorConfiguration.primary}
                        />
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
        columnGap: 10,
    },
    buttonLabel: {
        fontSize: 14,
        lineHeight: 27,
        fontFamily: "Avenir-Roman",
    },
});
