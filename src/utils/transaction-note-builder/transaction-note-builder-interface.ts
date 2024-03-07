import { IExpense } from "@splitsies/shared-models";

export interface ITransactionNoteBuilder {
    build(expense: IExpense, maxNoteLength?: number): string;
}

export const ITransactionNoteBuilder = Symbol.for("ITransactionNoteBuilder");
