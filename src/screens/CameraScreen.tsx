import React, { useRef } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native-ui-lib/core";
import { useInitialize } from "../hooks/use-initialize";
import { lazyInject } from "../utils/lazy-inject";
import { IPersmissionRequester } from "../utils/permission-requester/permission-requester-interface";
import { useCameraDevice, Camera } from "react-native-vision-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackScreenParams } from "./root-stack-screen-params";
import { CameraOverlay } from "../components/CameraOverlay";
import { IImage } from "../models/image/image-interface";

const _permissionRequest = lazyInject<IPersmissionRequester>(IPersmissionRequester);

type Props = NativeStackScreenProps<RootStackScreenParams, "CameraScreen">;

export const CameraScreen = ({ navigation }: Props): JSX.Element => {
    const devices = Camera.getAvailableCameraDevices();
    const device = useCameraDevice("back");
    const camera = useRef<Camera>(null);

    useInitialize(() => {
        _permissionRequest.requestCameraPersmission().then((permission) => console.log(permission));

        console.log(devices);
    });

    const onBackPress = () => {
        navigation.goBack();
    };

    const onImageSelected = (image: IImage): void => {
        navigation.navigate("ImageScreen", { image });
    };

    const capture = async (): Promise<void> => {
        if (!camera?.current) return;

        const file = await camera.current.takePhoto();
        const result = await fetch(`file://${file.path}`);
        const data = await result.blob();
    };

    return (
        <View>
            {device && <Camera ref={camera} style={StyleSheet.absoluteFill} device={device} photo isActive />}

            <CameraOverlay onBackPress={onBackPress} onImageSelected={onImageSelected} />
        </View>
    );
};
