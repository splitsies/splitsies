import { injectable } from "inversify";
import { ITransactionNoteBuilder } from "./transaction-note-builder-interface";
import { IExpense } from "../../models/expense/expense-interface";

@injectable()
export class TransactionNoteBuilder implements ITransactionNoteBuilder {
    build(personalExpense: IExpense, maxNoteLength: number = Number.MAX_SAFE_INTEGER): string {
        const noteLines = [];
        noteLines.push("Thanks for going Splitsies™");
        noteLines.push(`${personalExpense.name} - ${this.dateToMMDDYYYY(personalExpense.transactionDate)}`);
        noteLines.push(`Total: $${personalExpense.total.toFixed(2)}`);
        noteLines.push(
            ...personalExpense.items
                .filter((i) => !i.isProportional)
                .map((item) => {
                    if (item.price) return `${item.name}: $${item.price.toFixed(2)}`;
                }),
        );

        noteLines.push(
            ...personalExpense.items
                .filter((i) => i.isProportional)
                .map((item) => {
                    if (item.price) return `${item.name}: $${item.price.toFixed(2)}`;
                }),
        );

        let note = noteLines.join("\n").replace(/&/g, "%26");

        if (note.length > maxNoteLength) {
            note = note.slice(0, maxNoteLength - 4);
            return note + "...";
        }

        return note;
    }

    private dateToMMDDYYYY(date: Date): string {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear().toString();
        return `${month}/${day}/${year}`;
    }
}
