import { IExpense } from "../../models/expense/expense-interface";

export interface ITransactionNoteBuilder {
    build(expense: IExpense, maxNoteLength?: number): string;
    buildLinesForGroup(group: IExpense, personId: string, otherId: string): string[];
    buildForGroupBalance(group: IExpense, personId: string, otherId: string, maxNoteLength?: number): string;
    buildForIndividualSummary(group: IExpense, balances: Map<string, number>, personId: string, otherId: string, maxNoteLength?: number): string;
    buildForGroupSummary(group: IExpense, balances: Map<string, number>, personId: string): string
}

export const ITransactionNoteBuilder = Symbol.for("ITransactionNoteBuilder");
