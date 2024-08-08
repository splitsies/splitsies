import React, { useEffect, useState } from "react";
import { ExpandableSection } from "react-native-ui-lib";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseUserDetails, ExpenseItem as ExpenseItemModel } from "@splitsies/shared-models";
import { lazyInject } from "../utils/lazy-inject";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { IVenmoLinker } from "../utils/venmo-linker/venmo-linker-interface";
import { useComputed } from "../hooks/use-computed";
import { Alert } from "react-native";
import { ITransactionNoteBuilder } from "../utils/transaction-note-builder/transaction-note-builder-interface";
import { IndividualBalanceHeader } from "./IndividualBalanceHeader";
import { BalanceSummary } from "./BalanceSummary";

const _venmoLinker = lazyInject<IVenmoLinker>(IVenmoLinker);
const _transactionNoteBuilder = lazyInject<ITransactionNoteBuilder>(ITransactionNoteBuilder);

type Props = {
    expense: IExpense;
    balance: number;
    userId: string;
    person: IExpenseUserDetails;
    onCopyPress: (id: string) => void;
    allExpanded?: boolean;
}

export const GroupBalanceSection = SpThemedComponent(({ expense, userId, balance, person, onCopyPress, allExpanded }: Props) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    useEffect(() => {
        setExpanded(!!allExpanded);
    }, [allExpanded]);

    const balanceDetails = useComputed<string[], [IExpense, string, IExpenseUserDetails]>(
        ([expense, userId, person]) => _transactionNoteBuilder.buildLinesForGroup(expense, person.id, userId),
        [expense, userId, person]
    );

    const onChipPress = () => {
        Alert.alert(`Settle with Venmo?`, "", [
            {
                text: "Yes",
                onPress: () => {
                    _venmoLinker.linkWithNote(balance > 0 ? "charge" : "pay", balanceDetails.join("\n"));
                },
            },
            { text: "No", style: "cancel" },
        ]);
    };

    return (
        <ExpandableSection
            expanded={expanded}
            onPress={() => setExpanded(!expanded)}
            sectionHeader={
                <IndividualBalanceHeader
                    balance={balance}
                    expense={expense}
                    expanded={expanded}
                    userId={userId}
                    onSettle={onChipPress}
                    onCopyPress={onCopyPress}
                />
            }>
            <BalanceSummary expense={expense} primaryUserId={person.id} comparedUserId={userId} />
            
        </ExpandableSection>
    );
});
