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
    onImageSelected: (image: IImage) => void;
};

export const CameraOverlay = ({ onBackPress, onImageSelected }: Props) => {
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
            <SafeAreaView style={styles.container}>
                <View style={styles.backButton}>
                    <TouchableOpacity onPress={onBackPress}>
                        <Icon assetName="arrowBack" size={35} tintColor="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.contentContainer}>
                <SafeAreaView style={styles.buttonContainer}>
                    <TouchableOpacity onPress={onLibraryOpened}>
                        <Icon assetName="photoLibrary" size={35} tintColor="white" />
                    </TouchableOpacity>

                    {/* <TouchableOpacity onPress={props.onPress}>
                    <Icon iconPack="MaterialCommunityIcons" name="circle-slice-8" color={Color.WHITE} size={Size.LARGE_ICON} />
                    </TouchableOpacity>

                    <View style={{ width: Size.ICON }} /> */}
                </SafeAreaView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: "black",
    },
    container: {
        display: "flex",
        paddingHorizontal: 10,
        height: "100%",
        width: "100%",
        flexDirection: "column",
        flexGrow: 1,
        justifyContent: "space-between",
        backgroundColor: _colorConfiguration.darkOverlay,
    },
    contentContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingBottom: 60,
        paddingTop: 40,
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
