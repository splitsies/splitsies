export interface IImageConfiguration {
    readonly quality: number;
    readonly qrCodeTimeoutMs: number;
}

export const IImageConfiguration = Symbol.for("IImageConfiguration");
