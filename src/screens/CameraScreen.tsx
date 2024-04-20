import React, { useRef } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/params";
import { CameraOverlay } from "../components/CameraOverlay";
import { IImage } from "../models/image/image-interface";
import { Image } from "../models/image/image";
import { Camera } from "react-native-camera-kit";

type Props = NativeStackScreenProps<RootStackParamList, "CameraScreen">;

export const CameraScreen = ({ navigation }: Props): JSX.Element => {
    const camera = useRef<Camera>(null);

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

        const file = await camera.current.capture();
        const uri = file.uri;
        const result = await fetch(uri);
        const data = await result.blob();
        const base64 = await blobToBase64(data);
        const image = new Image(base64, uri, false);
        navigation.navigate("ImageScreen", { image });
    };

    return (
        <CameraOverlay ref={camera} onBackPress={onBackPress} onImageSelected={onImageSelected} onCapture={capture} />
    );
};
