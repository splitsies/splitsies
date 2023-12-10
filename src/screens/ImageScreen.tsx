import React, { useState } from "react";
import { Alert, ImageBackground, SafeAreaView, StyleSheet } from "react-native";
import { View } from "react-native-ui-lib/core";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackScreenParams } from "./root-stack-screen-params";
import { ActionBar, LoaderScreen } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";

type Props = NativeStackScreenProps<RootStackScreenParams, "ImageScreen">;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

export const ImageScreen = ({ navigation, route: { params: image } }: Props): JSX.Element => {
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const onBackPress = () => {
        navigation.goBack();
    };

    const onConfirm = async (): Promise<void> => {
        setIsProcessing(true);
        const result = await _expenseManager.createExpense(image.image.base64);
        setIsProcessing(false);

        if (result) {
            navigation.navigate("ExpenseScreen");
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
                        { label: "Cancel", onPress: onBackPress },
                        { label: "Confirm", onPress: onConfirm },
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
