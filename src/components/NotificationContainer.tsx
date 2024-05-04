import React, { useRef, useState } from "react";
import { Container } from "./Container";
import { BannerNotification } from "./BannerNotification";
import { lazyInject } from "../utils/lazy-inject";
import { IMessageHub } from "../hubs/message-hub/message-hub-interface";
import { IPushMessageHandlerProvider } from "../providers/push-message-handler-provider/push-message-handler-provider-interface";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { IPushMessage } from "../models/push-message/push-message-interface";
import { useObservableReducer } from "../hooks/use-observable-reducer";

const _handlerProvider = lazyInject<IPushMessageHandlerProvider>(IPushMessageHandlerProvider);
const _messageHub = lazyInject<IMessageHub>(IMessageHub);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = {
    children: React.ReactNode;
};

export const NotificationContainer = ({ children }: Props) => {
    const [notificationVisible, setNotificationVisible] = useState<boolean>(false);
    const onNotificationPress = useRef<(() => void) | undefined>(() => {});
    const pushMessage = useRef<IPushMessage | undefined>();

    useObservableReducer(_messageHub.foregroundNotificationReceived$, undefined, (message) => {
        onNotificationPress.current = _handlerProvider.provide(message);
        pushMessage.current = message;
        setNotificationVisible(true);

        setTimeout(() => {
            setNotificationVisible(false);
            setTimeout(() => {
                onNotificationPress.current = undefined;
                pushMessage.current = undefined;
            }, _uiConfig.durations.notificationDismissDurationMs);
        }, _uiConfig.durations.notificationTimeoutMs);
    });

    return (
        <Container>
            <BannerNotification
                visible={notificationVisible}
                onPress={onNotificationPress.current}
                message={pushMessage.current}
            />
            {children}
        </Container>
    );
};
