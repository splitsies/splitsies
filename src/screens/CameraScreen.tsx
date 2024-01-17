import React, { useRef } from "react";
import { Camera } from "react-native-vision-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/params";
import { CameraOverlay } from "../components/CameraOverlay";
import { IImage } from "../models/image/image-interface";
import { Image } from "../models/image/image";
import { CameraView } from "../components/CameraView";

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

        const file = await camera.current.takePhoto({ qualityPrioritization: "speed" });
        const uri = `file://${file.path}`;
        const result = await fetch(uri);
        const data = await result.blob();
        const base64 = await blobToBase64(data);
        const image = new Image(base64, uri, file.height, file.width, false);
        navigation.navigate("ImageScreen", { image });
    };

    return (
        <CameraView ref={camera}>
            <CameraOverlay onBackPress={onBackPress} onImageSelected={onImageSelected} onCapture={capture} />
        </CameraView>
    );
};
