import { injectable } from "inversify";
import { IVenmoLinker } from "./venmo-linker-interface";
import { IExpense } from "@splitsies/shared-models";
import { Alert, Linking } from "react-native";

@injectable()
export class VenmoLinker implements IVenmoLinker {
    link(transaction: "pay" | "charge", personalExpense: IExpense): void {
        const uri = encodeURI(
            `venmo://paycharge?txn=${transaction}&amount=${personalExpense.total}&note=${this.buildTransactionNote(
                personalExpense,
            )}`,
        );

        Linking.openURL(uri).catch((_) => Alert.alert("Venmo not found", "Install Venmo to settle the bill!"));
    }

    private buildTransactionNote(personalExpense: IExpense): string {
        let noteLines = [];
        noteLines.push("Split™ with ❤️");
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

        noteLines.push(`Total: $${personalExpense.total.toFixed(2)}`);
        return noteLines.join("\n").replace(/&/g, "%26");
    }

    private dateToMMDDYYYY(date: Date): string {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");

        const day = date.getDate().toString().padStart(2, "0");

        const year = date.getFullYear().toString();

        return `${month}/${day}/${year}`;
    }
}
