import React from "react";
import { StyleSheet, SafeAreaView, View, Text } from "react-native";
import { Icon, TouchableOpacity } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IImageConfiguration } from "../models/configuration/image-config/image-configuration-interface";
import { launchImageLibrary, MediaType, PhotoQuality } from "react-native-image-picker";
import { IImage } from "../models/image/image-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _imageConfiguration = lazyInject<IImageConfiguration>(IImageConfiguration);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

const options = {
    mediaType: "photo" as MediaType,
    quality: _imageConfiguration.quality as PhotoQuality,
    includeBase64: true,
};

type Props = {
    onBackPress: () => void;
    onCapture: () => void;
    onImageSelected: (image: IImage) => void;
};

export const CameraOverlay = ({ onBackPress, onCapture, onImageSelected }: Props) => {
    const onLibraryOpened = (): void => {
        launchImageLibrary(options, (response) => {
            if (response.didCancel || response.errorCode || !response.assets?.[0]) return;
            const selectedAsset = response.assets[0];
            onImageSelected({
                base64: selectedAsset.base64!,
                uri: selectedAsset.uri!,
                height: selectedAsset.height!,
                width: selectedAsset.width!,
                fromLibrary: true,
            });
        });
    };

    return (
        <View style={styles.background}>
            <View style={styles.headerContainer}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.backButton}>
                        <TouchableOpacity onPress={onBackPress}>
                            <Icon assetName="arrowBack" size={27} tintColor="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.contentContainer}>
                <SafeAreaView style={styles.buttonContainer}>
                    <TouchableOpacity onPress={onLibraryOpened}>
                        <Icon assetName="photoLibrary" size={27} tintColor="white" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onCapture}>
                        <Icon assetName="capture" tintColor={_colorConfiguration.white} size={70} />
                    </TouchableOpacity>

                    <View style={{ width: 35 }} />
                </SafeAreaView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        display: "flex",
        justifyContent: "space-between",
        flexGrow: 1,
    },
    container: {
        display: "flex",
        paddingHorizontal: 10,
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    headerContainer: { backgroundColor: _colorConfiguration.darkOverlay, paddingVertical: 15 },
    contentContainer: {
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
    backButton: {
        marginLeft: 15,
    },
});
