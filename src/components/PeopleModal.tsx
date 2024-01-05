import React, { useRef, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import { ActionBar, Chip, Icon, Modal, TextField, TouchableOpacity, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { useInitialize } from "../hooks/use-initialize";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IExpenseJoinRequest, IExpenseUserDetails } from "@splitsies/shared-models";
import { ListSeparator } from "./ListSeparator";
import { AddGuestForm } from "./AddGuestForm";
import { UserInviteListItem } from "./UserInviteListItem";
import { useObservable } from "../hooks/use-observable";
import { CameraView } from "./CameraView";
import { IQrPayload } from "../models/qr-payload/qr-payload-interface";
import { Code } from "react-native-vision-camera";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { IImageConfiguration } from "../models/configuration/image-config/image-configuration-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _imageConfiguration = lazyInject<IImageConfiguration>(IImageConfiguration);

let timeoutId: NodeJS.Timeout;

type Props = {
    visible: boolean;
    pendingJoinRequests: IExpenseJoinRequest[];
    expenseUsers: IExpenseUserDetails[];
    onAddGuest: (givenName: string, phoneNumber: string) => Promise<void>;
    onCancel: () => void;
    onUserSelectionChanged: (user: IExpenseUserDetails) => void;
    onRemoveRequest: (user: IExpenseUserDetails) => void;
};

export const PeopleModal = ({
    visible,
    pendingJoinRequests,
    onCancel,
    onAddGuest,
    expenseUsers,
    onUserSelectionChanged,
    onRemoveRequest,
}: Props) => {
    const contactUsers = useObservable(_userManager.contactUsers$, []);

    const [addGuestVisible, setAddGuestVisible] = useState<boolean>(false);
    const [codeScannerVisible, setCodeScannerVisible] = useState<boolean>(false);
    const [userViewFilter, setUserViewFilter] = useState<"contacts" | "guests">("contacts");
    const [searchFilter, setSearchFilter] = useState<string>("");
    const [scannedUser, setScannedUser] = useState<IQrPayload | null>(null);

    useInitialize(() => {
        void _userManager.requestUsersFromContacts();
    });

    const onSaveGuest = async (name: string): Promise<void> => {
        await onAddGuest(name, "");
        setAddGuestVisible(false);
    };

    const onAddPress = (): void => {
        switch (userViewFilter) {
            case "contacts":
                setCodeScannerVisible(!codeScannerVisible);
                break;
            case "guests":
                setAddGuestVisible(true);
                break;
        }
    };

    const onScannedUserAdded = () => {
        console.log({ scannedUser, expense: _expenseManager.currentExpense });
        if (!scannedUser || !_expenseManager.currentExpense) return;

        console.log(`adding ${scannedUser.id} to  ${_expenseManager.currentExpense.id}`);
        _expenseManager.requestAddUserToExpense(scannedUser.id, _expenseManager.currentExpense.id);
    };

    const onCodeScanned = (codes: Code[]): void => {
        try {
            const rawPayload = codes.find((c) => {
                const parsed = JSON.parse(c.value ?? "") as IQrPayload;
                return parsed.id !== undefined && parsed.familyName !== undefined && parsed.givenName !== undefined;
            });

            if (!rawPayload) return;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => setScannedUser(null), _imageConfiguration.qrCodeTimeoutMs);
            const payload = JSON.parse(rawPayload.value!) as IQrPayload;
            setScannedUser(payload);
        } catch (_) {}
    };

    const loadIconName = (): string => {
        if (userViewFilter === "guests") return "addUser";
        if (!codeScannerVisible) return "qrAdd";
        return "close";
    };

    const loadContent = (): JSX.Element => {
        if (addGuestVisible) {
            return <AddGuestForm onSave={onSaveGuest} onCancel={() => setAddGuestVisible(false)} />;
        }

        if (codeScannerVisible) {
            return (
                <CameraView onCodeScanned={onCodeScanned}>
                    <View
                        style={{
                            display: "flex",
                            flex: 1,
                            flexGrow: 1,
                            justifyContent: "flex-end",
                            alignItems: "center",
                            paddingBottom: 20,
                        }}
                    >
                        {scannedUser && (
                            <Chip
                                activeOpacity={0.5}
                                disabled={expenseUsers.some((e) => e.id === scannedUser.id)}
                                labelStyle={styles.buttonLabel}
                                containerStyle={{
                                    width: 120,
                                    borderColor: _colorConfiguration.primary,
                                }}
                                backgroundColor={_colorConfiguration.primary}
                                label={`Add ${scannedUser.givenName} ${scannedUser.familyName}`}
                                onPress={onScannedUserAdded}
                            />
                        )}
                    </View>
                </CameraView>
            );
        }

        return (
            <FlatList
                style={styles.list}
                data={
                    userViewFilter === "contacts"
                        ? contactUsers.filter(
                              (u) =>
                                  `${u.givenName} ${u.familyName}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                  u.phoneNumber.includes(searchFilter),
                          )
                        : expenseUsers.filter(
                              (u) => !u.phoneNumber && u.givenName.toLowerCase().includes(searchFilter.toLowerCase()),
                          )
                }
                keyExtractor={(i) => i.id + i.phoneNumber}
                ItemSeparatorComponent={ListSeparator}
                renderItem={({ item: user }) => (
                    <UserInviteListItem
                        user={user}
                        contactUsers={contactUsers}
                        expenseUsers={expenseUsers}
                        pendingJoinRequests={pendingJoinRequests}
                        onInviteUser={() => onUserSelectionChanged(user)}
                        onUninviteUser={() => onRemoveRequest(user)}
                    />
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
                            <Icon assetName="arrowBack" size={27} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextField
                            body
                            placeholder="Search"
                            placeholderTextColor={_colorConfiguration.greyFont}
                            value={searchFilter}
                            style={styles.textInput}
                            onChangeText={setSearchFilter}
                        />
                    </View>

                    <View style={styles.addUserContainer}>
                        <TouchableOpacity onPress={onAddPress}>
                            <Icon assetName={loadIconName()} size={27} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.body}>
                    {loadContent()}
                    {!addGuestVisible && !codeScannerVisible && (
                        <ActionBar
                            style={{
                                backgroundColor: "rgba(0,0,0,0)",
                                borderTopColor: _colorConfiguration.greyFont,
                                borderTopWidth: 1,
                            }}
                            keepRelative
                            useSafeArea
                            centered
                            actions={[
                                {
                                    label: "Contacts",
                                    onPress: () => setUserViewFilter("contacts"),
                                    color: _colorConfiguration.black,
                                    labelStyle: { fontSize: 13, fontFamily: "Avenir-Roman" },
                                },
                                {
                                    label: "Guests",
                                    onPress: () => setUserViewFilter("guests"),
                                    color: _colorConfiguration.black,
                                    labelStyle: { fontSize: 13, fontFamily: "Avenir-Roman" },
                                },
                            ]}
                        />
                    )}
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
    },
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    body: {
        display: "flex",
        flexGrow: 1,
        flex: 1,
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
    list: {
        width: "100%",
        paddingHorizontal: 10,
    },
    buttonLabel: {
        fontSize: 14,
        lineHeight: 27,
        fontFamily: "Avenir-Roman",
    },
});
