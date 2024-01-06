import React, { forwardRef, useCallback, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native-ui-lib/core";
import { useInitialize } from "../hooks/use-initialize";
import { lazyInject } from "../utils/lazy-inject";
import { IPersmissionRequester } from "../utils/permission-requester/permission-requester-interface";
import { useCameraDevice, Camera, CameraRuntimeError, useCodeScanner, Code } from "react-native-vision-camera";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _permissionRequest = lazyInject<IPersmissionRequester>(IPersmissionRequester);

type Props = {
    enableCodeScanner?: boolean;
    children?: React.ReactNode;
    onCodeScanned?: (codes: Code[]) => void;
};

export const CameraView = forwardRef<Camera, Props>(({ children, onCodeScanned }: Props, ref): JSX.Element => {
    const device = useCameraDevice("back");
    const [isActive, setIsActive] = useState<boolean>(true);

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned: onCodeScanned ?? (() => {}),
    });

    useInitialize(() => {
        setIsActive(true);
        _permissionRequest.requestCameraPersmission();

        return () => setIsActive(false);
    });

    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error);
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: _colorConfiguration.black }]}>
            {device && (
                <Camera
                    ref={ref}
                    onError={onError}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    photo
                    codeScanner={codeScanner}
                    isActive={isActive}
                />
            )}

            {children}
        </View>
    );
});
