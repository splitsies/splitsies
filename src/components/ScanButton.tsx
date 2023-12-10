import React from "react";
import { StyleSheet, View, TouchableOpacity, Platform, Animated } from "react-native";
import { Icon } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    onPress: () => void;
};

export const ScanButton = ({ onPress }: Props) => {
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onPress}>
                    <View style={styles.cameraButton}>
                        <Icon assetName="camera" size={30} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // position: 'absolute',
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-evenly",
        alignItems: "flex-end",
        paddingHorizontal: 10,
        height: 50,
        marginBottom: 0,
        shadowColor: _colorConfiguration.darkOverlay,
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    buttonContainer: {
        width: "100%",
        alignItems: "center",
    },
    cameraButton: {
        backgroundColor: _colorConfiguration.primary,
        borderRadius: 50,
        width: 75,
        height: 75,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
});
