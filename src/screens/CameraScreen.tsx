import React, { useCallback, useRef } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native-ui-lib/core";
import { useInitialize } from "../hooks/use-initialize";
import { lazyInject } from "../utils/lazy-inject";
import { IPersmissionRequester } from "../utils/permission-requester/permission-requester-interface";
import { useCameraDevice, Camera, CameraRuntimeError } from "react-native-vision-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackScreenParams } from "./root-stack-screen-params";
import { CameraOverlay } from "../components/CameraOverlay";
import { IImage } from "../models/image/image-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Image } from "../models/image/image";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _permissionRequest = lazyInject<IPersmissionRequester>(IPersmissionRequester);

type Props = NativeStackScreenProps<RootStackScreenParams, "CameraScreen">;

export const CameraScreen = ({ navigation }: Props): JSX.Element => {
    const device = useCameraDevice("back");
    const camera = useRef<Camera>(null);

    useInitialize(() => {
        _permissionRequest.requestCameraPersmission();
    });

    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error);
    }, []);

    const onBackPress = () => {
        navigation.goBack();
    };

    const onImageSelected = (image: IImage): void => {
        navigation.navigate("ImageScreen", { image });
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                const base64 = String(reader.result);
                const parts = base64.split(",");
                resolve(parts[1] ?? parts[0]);
            };
            reader.readAsDataURL(blob);
        });
    };

    const capture = async (): Promise<void> => {
        if (!camera?.current) return;

        const file = await camera.current.takePhoto({ qualityPrioritization: "speed" });
        const uri = `file://${file.path}`;
        const result = await fetch(uri);
        const data = await result.blob();
        const base64 = await blobToBase64(data);
        const image = new Image(base64, uri, file.height, file.width, false);
        navigation.navigate("ImageScreen", { image });
    };

    return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: _colorConfiguration.black }]}>
            {device && (
                <Camera ref={camera} onError={onError} style={StyleSheet.absoluteFill} device={device} photo isActive />
            )}

            <CameraOverlay onBackPress={onBackPress} onImageSelected={onImageSelected} onCapture={capture} />
        </View>
    );
};
