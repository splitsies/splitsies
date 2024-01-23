import React, { MutableRefObject, forwardRef, useCallback, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native-ui-lib/core";
import { useInitialize } from "../hooks/use-initialize";
import { lazyInject } from "../utils/lazy-inject";
import { IPersmissionRequester } from "../utils/permission-requester/permission-requester-interface";
import { useCameraDevice, Camera, CameraRuntimeError, useCodeScanner, Code, Point } from "react-native-vision-camera";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { FocusIndicator } from "./FocusIndicator";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _permissionRequest = lazyInject<IPersmissionRequester>(IPersmissionRequester);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = {
    enableCodeScanner?: boolean;
    children?: React.ReactNode;
    onCodeScanned?: (codes: Code[]) => void;
};

export const CameraView = forwardRef<Camera, Props>(({ children, onCodeScanned }: Props, ref): JSX.Element => {
    const device = useCameraDevice("back");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [focusPosition, setFocusPosition] = useState<Point | null>(null);
    const camera = useRef<Camera>(null);

    useInitialize(() => {
        setIsActive(true);
        _permissionRequest.requestCameraPersmission();

        return () => setIsActive(false);
    });

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned: onCodeScanned ?? (() => {}),
    });

    const focus = useCallback(
        (point: Point) => {
            try {
                if (!device?.supportsFocus) return;
                if (!ref && !camera) return;

                setFocusPosition(point);
                ((ref ?? camera) as MutableRefObject<Camera>)?.current?.focus(point);
            } catch (e) {
                console.error(e);
            } finally {
                setTimeout(() => setFocusPosition(null), _uiConfig.durations.focusThrottleMs);
            }
        },
        [ref, camera, device],
    );

    const gesture = Gesture.Tap().onEnd(({ x, y }) => {
        runOnJS(focus)({ x, y });
    });

    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error);
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: _colorConfiguration.black }]}>
            {device && (
                <Camera
                    ref={ref ?? camera}
                    onError={onError}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    photo
                    codeScanner={codeScanner}
                    isActive={isActive}
                />
            )}

            {focusPosition && <FocusIndicator x={focusPosition.x} y={focusPosition.y} />}
            <GestureDetector gesture={gesture}>{children}</GestureDetector>
        </View>
    );
});
