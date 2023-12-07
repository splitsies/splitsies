import React, { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import { Checkbox, Icon, Modal, Text, TextField, TouchableOpacity, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { useInitialize } from "../hooks/use-initialize";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IExpenseUserDetails, IUserDto } from "@splitsies/shared-models";
import { ListSeparator } from "./ListSeparator";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _userManager = lazyInject<IUserManager>(IUserManager);

type Props = {
    visible: boolean;
    expenseUsers: IExpenseUserDetails[];
    onCancel: () => void;
    onUserSelectionChanged: (id: string, included: boolean) => void;
};

export const PeopleModal = ({ visible, onCancel, expenseUsers, onUserSelectionChanged }: Props) => {
    const [contactUsers, setContactUsers] = useState<IUserDto[]>([]);

    useInitialize(() => {
        const subscription = _userManager.contactUsers$.subscribe({
            next: (users) => setContactUsers(users),
        });

        return () => subscription.unsubscribe();
    });

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
                </View>

                <FlatList
                    style={styles.list}
                    data={contactUsers}
                    ItemSeparatorComponent={ListSeparator}
                    renderItem={({ item: user }) => (
                        <View style={styles.itemContainer}>
                            <Checkbox
                                size={18}
                                containerStyle={styles.checkbox}
                                color={_colorConfiguration.primary}
                                value={expenseUsers.some((u) => u.id === user.id)}
                                onValueChange={(val) => onUserSelectionChanged(user.id, val)}
                            />
                            <View>
                                <Text body numberOfLines={1} ellipsizeMode={"tail"}>
                                    {user.givenName + " " + user.familyName}
                                </Text>
                                <Text hint>{user.phoneNumber}</Text>
                            </View>
                        </View>
                    )}
                />
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
    arrowContainer: {
        display: "flex",
        height: 50,
        justifyContent: "center",
        paddingRight: 5,
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
