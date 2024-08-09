import { injectable } from "inversify";
import { NotificationType } from "../../types/notification-type";
import { lazyInject } from "../../utils/lazy-inject";
import { IWritableMessageHub } from "../../hubs/writable-message-hub/writable-message-hub-interface";
import { PushMessage } from "../../models/push-message/push-message";
import { Linking } from "react-native";
import { IPushMessage } from "../../models/push-message/push-message-interface";
import { IPushMessageHandlerProvider } from "./push-message-handler-provider-interface";

@injectable()
export class PushMessageHandlerProvider implements IPushMessageHandlerProvider {
    private readonly _messageHub = lazyInject<IWritableMessageHub>(IWritableMessageHub);

    provide(message: IPushMessage): () => void {
        switch (message.type) {
            case NotificationType.JoinRequest:
                return () => {
                    this._messageHub.publishNotificationOpened(
                        new PushMessage(NotificationType.JoinRequest, message.data),
                    );
                    void Linking.openURL(`splitsies://requests/${message.data?.expenseId}`);
                };
            default:
                return () => {};
        }
    }
}
