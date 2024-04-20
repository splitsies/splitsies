import { IImage } from "./image-interface";

export class Image implements IImage {
    constructor(readonly base64: string, readonly uri: string, readonly fromLibrary: boolean) {}
}
