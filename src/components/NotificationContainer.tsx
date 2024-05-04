import React, { useRef, useState } from "react"
import { Container } from "./Container";
import { BannerNotification } from "./BannerNotification";
import { lazyInject } from "../utils/lazy-inject";
import { IMessageHub } from "../hubs/message-hub/message-hub-interface";
import { useInitialize } from "../hooks/use-initialize";
import { IPushMessageHandlerProvider } from "../providers/push-message-handler-provider/push-message-handler-provider-interface";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";


const _handlerProvider = lazyInject<IPushMessageHandlerProvider>(IPushMessageHandlerProvider);
const _messageHub = lazyInject<IMessageHub>(IMessageHub);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = {
    children: React.ReactNode;
}

export const NotificationContainer = ({ children }: Props) => {
    const [notificationVisible, setNotificationVisible] = useState<boolean>(false);
    const onNotificationPress = useRef<(() => void) | undefined>(() => { });

    useInitialize(() => {
        _messageHub.foregroundNotificationReceived$.subscribe({
            next: (message) => {
                onNotificationPress.current = _handlerProvider.provide(message);
                setNotificationVisible(true);

                setTimeout(() => {
                    onNotificationPress.current = undefined;
                    setNotificationVisible(false);
                }, _uiConfig.durations.notificationTimeoutMs);
            }
        });
    });

    return (
        <Container>
            <BannerNotification visible={notificationVisible} onPress={onNotificationPress.current} />
            {children}
        </Container>
    )
};