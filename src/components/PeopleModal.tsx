import React, { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import { ActionBar, Checkbox, Icon, Modal, Text, TextField, TouchableOpacity, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { useInitialize } from "../hooks/use-initialize";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { ListSeparator } from "./ListSeparator";
import { AddGuestForm } from "./AddGuestForm";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _userManager = lazyInject<IUserManager>(IUserManager);

type Props = {
    visible: boolean;
    expenseUsers: IExpenseUserDetails[];
    onAddGuest: (givenName: string, phoneNumber: string) => Promise<void>;
    onCancel: () => void;
    onUserSelectionChanged: (user: IExpenseUserDetails, included: boolean) => void;
};

export const PeopleModal = ({ visible, onCancel, onAddGuest, expenseUsers, onUserSelectionChanged }: Props) => {
    const [contactUsers, setContactUsers] = useState<IExpenseUserDetails[]>([]);
    const [addGuestVisible, setAddGuestVisible] = useState<boolean>(false);
    const [userViewFilter, setUserViewFilter] = useState<"contacts" | "guests">("contacts");

    useInitialize(() => {
        const subscription = _userManager.contactUsers$.subscribe({
            next: (users) => setContactUsers(users),
        });

        void _userManager.requestUsersFromContacts();

        return () => subscription.unsubscribe();
    });

    const onSaveGuest = async (name: string): Promise<void> => {
        await onAddGuest(name, "");
        setAddGuestVisible(false);
    };

    const loadContent = (): JSX.Element => {
        return addGuestVisible ? (
            <AddGuestForm onSave={onSaveGuest} onCancel={() => setAddGuestVisible(false)} />
        ) : (
            <FlatList
                style={styles.list}
                data={userViewFilter === "contacts" ? contactUsers : expenseUsers.filter((u) => !u.phoneNumber)}
                keyExtractor={(i) => i.id + i.phoneNumber}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({ item: user }) => (
                    <View style={styles.itemContainer}>
                        <Checkbox
                            size={18}
                            containerStyle={styles.checkbox}
                            color={_colorConfiguration.primary}
                            value={expenseUsers.some((u) => u.id === user.id)}
                            onValueChange={(val) => onUserSelectionChanged(user, val)}
                        />

                        <TouchableOpacity
                            onPress={() => onUserSelectionChanged(user, !expenseUsers.some((u) => u.id === user.id))}
                            style={{ display: "flex", flexGrow: 1 }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexGrow: 1,
                                    justifyContent: "space-between",
                                }}
                            >
                                <View>
                                    <Text body numberOfLines={1} ellipsizeMode={"tail"}>
                                        {user.givenName + " " + user.familyName}
                                    </Text>
                                    <Text hint>{user.phoneNumber || "Guest"}</Text>
                                </View>

                                {!!user.id && (
                                    <View style={styles.logoContainer}>
                                        <Icon assetName={user.isRegistered ? "logoPrimary" : "logoGrey"} size={35} />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            />
        );
    };

    return (
        <Modal enableModalBlur visible={visible} animationType="slide">
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.arrowContainer}>
                        <TouchableOpacity onPress={onCancel}>
                            <Icon assetName="arrowBack" size={35} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextField body placeholder="Search" style={styles.textInput} />
                    </View>

                    <View style={styles.addUserContainer}>
                        <TouchableOpacity onPress={() => setAddGuestVisible(true)}>
                            <Icon assetName="addUser" size={35} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.body}>
                    {loadContent()}
                    <ActionBar
                        style={{ backgroundColor: "rgba(0,0,0,0)" }}
                        keepRelative
                        useSafeArea
                        centered
                        actions={[
                            { label: "Contacts", onPress: () => setUserViewFilter("contacts") },
                            { label: "Guests", onPress: () => setUserViewFilter("guests") },
                        ]}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        rowGap: 10,
        alignItems: "center",
        height: "100%",
        marginHorizontal: 10,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
    },
    body: {
        display: "flex",
        flexGrow: 1,
        width: "100%",
    },
    arrowContainer: {
        display: "flex",
        height: 50,
        justifyContent: "center",
        paddingRight: 5,
    },
    addUserContainer: {
        display: "flex",
        height: 50,
        justifyContent: "center",
        paddingLeft: 5,
    },
    logoContainer: {
        display: "flex",
        flexGrow: 1,
        alignItems: "flex-end",
        paddingEnd: 20,
    },
    inputContainer: {
        display: "flex",
        flex: 1,
        height: 50,
    },
    textInput: {
        height: 50,
        backgroundColor: "white",
        borderRadius: 25,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: _colorConfiguration.divider,
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginVertical: 10,
        marginHorizontal: 10,
    },
    checkbox: {
        marginRight: 10,
    },
    list: {
        width: "100%",
    },
});
