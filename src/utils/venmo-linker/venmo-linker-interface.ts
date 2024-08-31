import { IExpense } from "../../models/expense/expense-interface";

export interface IVenmoLinker {
    link(transaction: "pay" | "charge", personalExpense: IExpense): void;
    linkWithNote(transaction: "pay" | "charge", note: string, amount: number): void;
}
export const IVenmoLinker = Symbol.for("IVenmoLinker");
