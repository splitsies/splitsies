import { injectable } from "inversify";
import { ITransactionNoteBuilder } from "./transaction-note-builder-interface";
import { IExpense } from "../../models/expense/expense-interface";
import { lazyInject } from "../lazy-inject";
import { IBalanceCalculator } from "../balance-calculator/balance-calculator-interface";
import { format } from "../format-price";

@injectable()
export class TransactionNoteBuilder implements ITransactionNoteBuilder {
    private readonly _balanceCalculator = lazyInject<IBalanceCalculator>(IBalanceCalculator);

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

    buildLinesForGroup(group: IExpense, personId: string, otherId: string): string[] {
        return group.children
            .filter((e) => e.payers[0]?.userId === personId || e.payers[0]?.userId === otherId)
            .map((c: IExpense) => {
                if (c.payers[0]?.userId === personId) {
                    const balance = this._balanceCalculator.calculate(c, otherId);
                    return `Owes you ${format(-balance.balance)} for ${c.name}`;
                }

                const balance = this._balanceCalculator.calculate(c, personId);
                return `You owe ${format(-balance.balance)} for ${c.name}`;
            });
    }

    buildForGroupBalance(
        group: IExpense,
        personId: string,
        otherId: string,
        maxNoteLength: number = Number.MAX_SAFE_INTEGER,
    ): string {
        const lines = this.buildLinesForGroup(group, personId, otherId);
        let note = lines.join("\n").replace(/&/g, "%26");

        if (note.length > maxNoteLength) {
            note = note.slice(0, maxNoteLength - 4);
            return note + "...";
        }

        return note;
    }

    buildForIndividualSummary(
        group: IExpense,
        balances: Map<string, number>,
        personId: string,
        otherId: string,
        maxNoteLength: number = Number.MAX_SAFE_INTEGER,
    ): string {
        const balance = balances.get(otherId)!;

        const lines = [];

        const netTotalLine =
            balance > 0
                ? `${group.users.find((u) => u.id === otherId)?.givenName} owes you ${format(balance)}`
                : `You owe ${group.users.find((u) => u.id === otherId)?.givenName} ${format(-balance)}`;

        lines.push(netTotalLine);

        const expensesPaidByUsers = group.children.filter(
            (e) => e.payers[0]?.userId === personId || e.payers[0]?.userId === otherId,
        );

        for (const c of expensesPaidByUsers) {
            const isPayer = c.payers[0]?.userId === personId;
            const balanceResult = isPayer
                ? this._balanceCalculator.calculate(c, otherId)
                : this._balanceCalculator.calculate(c, personId);

            lines.push(`${c.name}: ${format(isPayer ? balanceResult.balance : -balanceResult.balance)}`);
        }

        return lines.join("\n");
    }

    buildForGroupSummary(group: IExpense, balances: Map<string, number>, personId: string): string {
        const lines: string[] = [];
        const otherUserIds = group.users.filter((u) => u.id !== personId).map((u) => u.id);
        const netTotal = Array.from(balances.values()).reduce((p, c) => p + c, 0);

        const name = group.users.find((u) => u.id === personId)!.givenName;
        lines.push(name);

        const netTotalLine = `Net Total: ${netTotal < 0 ? "Owes" : "Owed"} ${format(Math.abs(netTotal))}`;
        lines.push(netTotalLine);
        lines.push("");

        for (const uid of otherUserIds) {
            lines.push(this.buildForIndividualSummary(group, balances, personId, uid));
            lines.push("");
        }

        return lines.join("\n");
    }

    private dateToMMDDYYYY(date: Date): string {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear().toString();
        return `${month}/${day}/${year}`;
    }
}
