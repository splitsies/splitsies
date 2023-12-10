export class Image implements IImage {
    constructor(
        readonly base64: string,
        readonly uri: string,
        readonly height: number,
        readonly width: number,
        readonly fromLibrary: boolean,
    ) {}
}
