import { IPushMessage } from "../../models/push-message/push-message-interface";

export interface IPushMessageHandlerProvider {
    provide(message: IPushMessage): () => void;
}

export const IPushMessageHandlerProvider = Symbol.for("IPushMessageHandlerProvider");
