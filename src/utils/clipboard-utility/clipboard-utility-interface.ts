export interface IClipboardUtility {
    copyToClipboard(data: string): void;
}

export const IClipboardUtility = Symbol.for("IClipboardUtility");
