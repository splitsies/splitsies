import React, { useEffect, useState } from "react";
import { Modal, View, SafeAreaView, TouchableOpacity, StyleSheet } from "react-native";
import { Chip, Toast, Colors } from "react-native-ui-lib";
import { CameraView } from "./CameraView";
import { IQrPayload } from "../models/qr-payload/qr-payload-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Code } from "react-native-vision-camera";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import ArrowBack from "../../assets/icons/arrow-back.svg";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { useObservableReducer } from "../hooks/use-observable-reducer";
import { IExpense } from "../models/expense/expense-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    scannedUser: IQrPayload | null;
    onScannedUserAdded: () => void;
    shouldDisableChip: boolean;
    onCodeScanned: (codes: Code[]) => void;
};

export const ScanUserModal = ({
    visible,
    setVisible,
    scannedUser,
    onScannedUserAdded,
    shouldDisableChip,
    onCodeScanned,
}: Props) => {
    const expenseUsers = useObservableReducer<IExpense | null, IExpenseUserDetails[]>(
        _expenseManager.currentExpense$,
        [],
        (e) => e?.users ?? []);

    const [chipLabel, setChipLabel] = useState<string>("");

    useEffect(() => {
        if (!scannedUser) {
            setChipLabel("");
            return;
        }
        if (expenseUsers.map((u) => u.id).includes(scannedUser.id)) {
            setChipLabel(
                `${scannedUser.givenName}${scannedUser.familyName ? " " + scannedUser.familyName : ""} has joined`,
            );
            return;
        }

        setChipLabel(`Add ${scannedUser.givenName} ${scannedUser.familyName}`);
    }, [expenseUsers, scannedUser]);

    return (
        <Modal visible={visible} animationType="fade">
            <CameraView onCodeScanned={onCodeScanned}>
                <View style={styles.cameraOverlay}>
                    {/* GestureDetector usage here is a workaround to block the tap from bubbling up and focusing the camera */}
                    <GestureDetector gesture={Gesture.Tap()}>
                        <SafeAreaView style={styles.headerContainer}>
                            <TouchableOpacity
                                style={{ marginTop: 32, marginLeft: 10, marginBottom: 20 }}
                                onPress={() => setVisible(false)}
                            >
                                <ArrowBack
                                    width={_uiConfig.sizes.icon}
                                    height={_uiConfig.sizes.icon}
                                    fill={Colors.white}
                                />
                            </TouchableOpacity>
                        </SafeAreaView>
                    </GestureDetector>

                    <Toast
                        body
                        centerMessage
                        messageStyle={_styleManager.typography.body}
                        visible={true}
                        renderAttachment={() =>
                            scannedUser ? (
                                <View style={{ width: "100%", alignItems: "center", paddingBottom: 20 }}>
                                    <Chip
                                        activeOpacity={0.5}
                                        disabled={shouldDisableChip}
                                        labelStyle={styles.buttonLabel}
                                        containerStyle={{
                                            minWidth: 120,
                                            borderColor: _colorConfiguration.primary,
                                        }}
                                        backgroundColor={_colorConfiguration.primary}
                                        label={chipLabel}
                                        onPress={onScannedUserAdded}
                                    />
                                </View>
                            ) : undefined
                        }
                        backgroundColor={_colorConfiguration.black}
                        position="bottom"
                        message="Scan the QR Code in the user's profile"
                    />
                </View>
            </CameraView>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        color: Colors.black,
    },
    cameraOverlay: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 80,
    },
    headerContainer: {
        backgroundColor: _colorConfiguration.darkOverlay,
        paddingBottom: 20,
        width: "100%",
    },
    toast: {
        width: "100%",
        alignItems: "center",
        height: 60,
        backgroundColor: "black",
    },
});
