export interface IVenmoConfiguration {
    readonly deepLinkUrl: string;
    readonly placeholders: { txn: string; amount: string; note: string };
    readonly maxNoteLength: number;
}
export const IVenmoConfiguration = Symbol.for("IVenmoConfiguration");
