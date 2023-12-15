import { IExpense } from "@splitsies/shared-models";

export interface IVenmoLinker {
    link(transaction: "pay" | "charge", personalExpense: IExpense): void;
}
export const IVenmoLinker = Symbol.for("IVenmoLinker");
