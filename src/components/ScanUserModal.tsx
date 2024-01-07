import React from "react";
import { Modal, View, SafeAreaView, TouchableOpacity, StyleSheet } from "react-native";
import { Icon, Chip, Toast } from "react-native-ui-lib";
import { CameraView } from "./CameraView";
import { IQrPayload } from "../models/qr-payload/qr-payload-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Code } from "react-native-vision-camera";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);

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
    return (
        <Modal visible={visible} animationType="slide">
            <CameraView onCodeScanned={onCodeScanned}>
                <View style={styles.cameraOverlay}>
                    <SafeAreaView style={styles.headerContainer}>
                        <TouchableOpacity style={{ margin: 15 }} onPress={() => setVisible(false)}>
                            <Icon assetName="arrowBack" size={27} tintColor="white" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    {scannedUser && (
                        <Chip
                            disabled={shouldDisableChip}
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

                    <Toast
                        body
                        centerMessage
                        messageStyle={_styleManager.typography.body}
                        visible={true}
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
    },
    cameraOverlay: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 20,
    },
    headerContainer: { backgroundColor: _colorConfiguration.darkOverlay, padding: 30, width: "100%" },
});
