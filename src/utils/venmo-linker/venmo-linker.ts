import { injectable } from "inversify";
import { IVenmoLinker } from "./venmo-linker-interface";
import { IExpense } from "@splitsies/shared-models";
import { Alert, Linking } from "react-native";
import { lazyInject } from "../lazy-inject";
import { IVenmoConfiguration } from "../../models/configuration/venmo-configuration/venmo-configuration-interface";
import { ITransactionNoteBuilder } from "../transaction-note-builder/transaction-note-builder-interface";

@injectable()
export class VenmoLinker implements IVenmoLinker {
    private readonly _configuration = lazyInject<IVenmoConfiguration>(IVenmoConfiguration);
    private readonly _transactionNoteBuilder = lazyInject<ITransactionNoteBuilder>(ITransactionNoteBuilder);

    link(transaction: "pay" | "charge", personalExpense: IExpense): void {
        const deepLinkUrl = this._configuration.deepLinkUrl
            .replace(this._configuration.placeholders.txn, transaction)
            .replace(this._configuration.placeholders.amount, `${personalExpense.total.toFixed(2)}`)
            .replace(
                this._configuration.placeholders.note,
                this._transactionNoteBuilder.build(personalExpense, this._configuration.maxNoteLength),
            );

        const uri = encodeURI(deepLinkUrl);
        Linking.openURL(uri).catch((_) => Alert.alert("Venmo not found", "Install Venmo to settle the bill!"));
    }

    linkWithNote(transaction: "pay" | "charge", note: string): void {
        const deepLinkUrl = this._configuration.deepLinkUrl
            .replace(this._configuration.placeholders.txn, transaction)
            .replace(this._configuration.placeholders.amount, `${personalExpense.total.toFixed(2)}`)
            .replace(this._configuration.placeholders.note, note);

        const uri = encodeURI(deepLinkUrl);
        Linking.openURL(uri).catch((_) => Alert.alert("Venmo not found", "Install Venmo to settle the bill!"));
    }
}
