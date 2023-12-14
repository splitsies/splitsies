import React from "react";
import { StyleSheet, View, TouchableOpacity, Platform, Animated } from "react-native";
import { Icon, Text } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    onPress: () => void;
    onFeedPress: () => void;
    onRequestsPress: () => void;
};

export const HomeBar = ({ onPress, onRequestsPress, onFeedPress }: Props) => {
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.tab} onPress={onFeedPress}>
                    <Text subtext>Feed</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={onPress}>
                    <View style={styles.cameraButton}>
                        <Icon assetName="camera" size={30} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={onRequestsPress}>
                    <Text subtext>Requests</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-evenly",
        alignItems: "flex-end",
        paddingHorizontal: 10,
        height: 50,
        marginBottom: 0,
        borderTopColor: _colorConfiguration.greyFont,
        borderTopWidth: 1,
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        justifyContent: "space-evenly",
        flexWrap: "nowrap",
    },
    cameraButton: {
        position: "relative",
        backgroundColor: _colorConfiguration.primary,
        shadowColor: _colorConfiguration.darkOverlay,
        elevation: 5,
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        bottom: 22,
        borderRadius: 50,
        width: 75,
        height: 75,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    tab: {
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
