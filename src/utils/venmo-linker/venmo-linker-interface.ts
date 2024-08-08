import { IExpense } from "@splitsies/shared-models";

export interface IVenmoLinker {
    link(transaction: "pay" | "charge", personalExpense: IExpense): void;
    linkWithNote(transaction: "pay" | "charge", note: string): void;
}
export const IVenmoLinker = Symbol.for("IVenmoLinker");
