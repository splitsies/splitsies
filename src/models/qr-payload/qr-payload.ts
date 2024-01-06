import { IQrPayload } from "./qr-payload-interface";

export class QrPayload implements IQrPayload {
    constructor(readonly id: string, readonly givenName: string, readonly familyName: string) {}
}
