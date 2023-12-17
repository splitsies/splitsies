import { injectable } from "inversify";
import { IVenmoLinker } from "./venmo-linker-interface";
import { IExpense } from "@splitsies/shared-models";
import { Alert, Linking } from "react-native";
import { lazyInject } from "../lazy-inject";
import { IVenmoConfiguration } from "../../models/configuration/venmo-configuration/venmo-configuration-interface";

@injectable()
export class VenmoLinker implements IVenmoLinker {
    private readonly _configuration = lazyInject<IVenmoConfiguration>(IVenmoConfiguration);

    link(transaction: "pay" | "charge", personalExpense: IExpense): void {
        const deepLinkUrl = this._configuration.deepLinkUrl
            .replace(this._configuration.placeholders.txn, transaction)
            .replace(this._configuration.placeholders.amount, `${personalExpense.total.toFixed(2)}`)
            .replace(this._configuration.placeholders.note, this.buildTransactionNote(personalExpense));

        const uri = encodeURI(deepLinkUrl);
        Linking.openURL(uri).catch((_) => Alert.alert("Venmo not found", "Install Venmo to settle the bill!"));
    }

    private buildTransactionNote(personalExpense: IExpense): string {
        let noteLines = [];
        noteLines.push("Thanks for going Splitsies™");
        noteLines.push(`Total: $${personalExpense.total.toFixed(2)}`);
        noteLines.push(`${personalExpense.name} - ${this.dateToMMDDYYYY(personalExpense.transactionDate)}`);
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

        if (note.length > this._configuration.maxNoteLength) {
            note = note.slice(0, this._configuration.maxNoteLength - 4);
            console.log({ note, length: note.length });
            return note + "...";
        }

        console.log({ note, length: note.length });

        return note;
    }

    private dateToMMDDYYYY(date: Date): string {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear().toString();
        return `${month}/${day}/${year}`;
    }
}
