import React, { useRef, useState } from "react";
import { Alert, ImageBackground, StyleSheet } from "react-native";
import { View } from "react-native-ui-lib/core";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/params";
import { ActionBar, LoaderScreen } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { IAdManager } from "../managers/ad-manager/ad-manager-interface";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
type Props = NativeStackScreenProps<RootStackParamList, "ImageScreen">;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _adManager = lazyInject<IAdManager>(IAdManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

export const ImageScreen = ({ navigation, route: { params: image } }: Props): JSX.Element => {
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const onBackPress = () => {
        navigation.goBack();
    };

    const onConfirm = async (): Promise<void> => {
        setIsProcessing(true);
        const ad = await _adManager.generateInterstitialAd();
        const result = await _expenseManager.createExpense(image.image.base64);
        setIsProcessing(false);

        if (result) {
            if (ad?.loaded) ad.show();
            setTimeout(() => navigation.navigate("ExpenseScreen"), _uiConfig.durations.adBufferMs);
        } else {
            Alert.alert("Processing Error", "Unable to read the receipt. Please try again with another image.", [
                { text: "OK", onPress: onBackPress },
            ]);
        }
    };

    return (
        <ImageBackground source={{ uri: image.image.uri }} resizeMode="contain" style={styles.background}>
            <View style={styles.contentContainer}>
                <ActionBar
                    style={{ zIndex: 2, backgroundColor: "rgba(0,0,0,0)" }}
                    keepRelative
                    centered
                    actions={[
                        {
                            label: "Cancel",
                            onPress: onBackPress,
                            color: _colorConfiguration.white,
                            labelStyle: { fontSize: 18, fontWeight: "600", fontFamily: "Avenir-Roman" },
                        },
                        {
                            label: "Confirm",
                            onPress: onConfirm,
                            color: _colorConfiguration.white,
                            labelStyle: { fontSize: 18, fontWeight: "600", fontFamily: "Avenir-Roman" },
                        },
                    ]}
                />
            </View>

            {isProcessing && (
                <View style={styles.overlay}>
                    <LoaderScreen />
                </View>
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: "black",
        height: "100%",
        width: "100%",
    },
    container: {
        display: "flex",
        zIndex: 2,
        paddingHorizontal: 10,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    backButton: {
        marginLeft: 15,
    },
    imageContainer: {
        position: "absolute",
        zIndex: 1,
        width: "100%",
        height: "100%",
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        position: "absolute",
        zIndex: 2,
        bottom: 0,
        width: "100%",
        paddingBottom: 40,
        paddingTop: 30,
        paddingHorizontal: 20,
        backgroundColor: _colorConfiguration.darkOverlay,
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 30,
    },
    overlay: {
        backgroundColor: _colorConfiguration.darkOverlay,
        width: "100%",
        height: "100%",
    },
});
