import React, { forwardRef, useRef } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native-ui-lib/core";
import { useInitialize } from "../hooks/use-initialize";
import { lazyInject } from "../utils/lazy-inject";
import { IPersmissionRequester } from "../utils/permission-requester/permission-requester-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Camera, CameraType } from "react-native-camera-kit";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _permissionRequest = lazyInject<IPersmissionRequester>(IPersmissionRequester);

type Props = {
    enableCodeScanner?: boolean;
    children?: React.ReactNode;
    onCodeScanned?: (event: any) => void;
};

export const CameraView = forwardRef<Camera, Props>(({ children, onCodeScanned }: Props, ref): JSX.Element => {
    const camera = useRef<Camera>(null);

    useInitialize(() => {
        _permissionRequest.requestCameraPersmission();
    });

    return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: _colorConfiguration.black }]}>
            <Camera
                ref={ref ?? camera}
                cameraType={CameraType.Back}
                style={StyleSheet.absoluteFill}
                scanBarcode={!!onCodeScanned}
                onReadCode={onCodeScanned}
            />
        </View>
    );
});
