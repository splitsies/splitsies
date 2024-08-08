import { Colors, Text, TouchableOpacity, View } from "react-native-ui-lib/core";
import Exchange from "../../assets/icons/exchange.svg";
import Copy from "../../assets/icons/copy.svg";
import React, { lazy } from "react";
import { format } from "../utils/format-price";
import { lazyInject } from "../utils/lazy-inject";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { CollapseableIndicator } from "./CollapseableIndicator";
import { IExpense } from "../models/expense/expense-interface";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { ITransactionNoteBuilder } from "../utils/transaction-note-builder/transaction-note-builder-interface";

const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _transactionNoteBuilder = lazyInject<ITransactionNoteBuilder>(ITransactionNoteBuilder);

type Props = {
    balance: number;
    expense: IExpense;
    expanded: boolean;
    userId: string;
    onSettle: () => void;
    onCopyPress: (id: string) => void;
};

export const IndividualBalanceHeader = SpThemedComponent(({ balance, expense, onSettle, expanded, userId, onCopyPress }: Props) => {


    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text>{balance > 0
                ? `${expense.users.find(u => u.id === userId)?.givenName} owes you ${format(balance)}`
                : `You owe ${expense.users.find(u => u.id === userId)?.givenName} ${format(-balance)}`}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", columnGap: 10 }}>
                <TouchableOpacity
                    onPress={() => onCopyPress(userId)}
                    style={{ backgroundColor: Colors.primary, padding: 7, borderRadius: 20 }}
                >
                    <Copy width={_uiConfig.sizes.smallIcon} height={_uiConfig.sizes.smallIcon} fill={Colors.bgColor} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onSettle}
                    style={{ backgroundColor: Colors.primary, padding: 7, borderRadius: 20 }}
                >
                    <Exchange width={_uiConfig.sizes.smallIcon} height={_uiConfig.sizes.smallIcon} fill={Colors.bgColor} />
                </TouchableOpacity>
                <CollapseableIndicator collapsed={!expanded} size={_uiConfig.sizes.smallIcon} />
            </View>
        </View>
    );
});