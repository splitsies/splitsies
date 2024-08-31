import React, { useState } from "react";
import { StyleSheet, NativeModules, Platform, TouchableOpacity, Alert } from "react-native";
import { ActionSheet, ButtonProps, Colors, Text, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { IExpense } from "../models/expense/expense-interface";
import { IBalanceCalculator } from "../utils/balance-calculator/balance-calculator-interface";
import { useComputed } from "../hooks/use-computed";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { BalanceResult } from "../models/balance-result";
import { format } from "../utils/format-price";
import { ItemSelectionProgressBar } from "./ItemSelectionProgressBar";
import { PeopleIconList } from "./PeopleIconList";
import Location from "../../assets/icons/location.svg";
import Calendar from "../../assets/icons/calendar.svg";
import People from "../../assets/icons/people.svg";
import Price from "../../assets/icons/price.svg";
import Exchange from "../../assets/icons/exchange.svg";
import Select from "../../assets/icons/select.svg";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";

const Locale = (
    Platform.OS === "ios"
        ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier
).replace(/_/, "-");

// this type is the same as DATE_OPTIONS to satisfy the typescript compiler
type DateTimeFormatOptions = { weekday: "long"; year: "numeric"; month: "long"; day: "numeric" };
const DATE_OPTIONS: DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _balanceCalculator = lazyInject<IBalanceCalculator>(IBalanceCalculator);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

const iconSize = _uiConfig.sizes.smallIcon;

interface propTypes {
    data: IExpense;
    person: IExpenseUserDetails;
    hidePeople?: boolean;
    showSelectionProgress?: boolean;
    onPress?: (expenseId: string) => void;
    showLongPressMenu?: boolean;
    onExpenseSelectedForGroupAdd?: (expenseId: string) => void;
    onExpenseSelectedForGroupRemove?: (expenseId: string) => void;
}

/**
 * @{@link propTypes}
 */
export const ExpensePreview = SpThemedComponent(
    ({
        data,
        showLongPressMenu,
        onPress,
        person,
        hidePeople,
        showSelectionProgress,
        onExpenseSelectedForGroupAdd,
        onExpenseSelectedForGroupRemove,
    }: propTypes) => {
        if (!data) return null;
        const [actionsVisible, setActionsVisible] = useState<boolean>(false);

        const balance = useComputed<BalanceResult, [IExpense, IExpenseUserDetails]>(
            ([data, person]) => _balanceCalculator.calculate(data, person.id),
            [data, person],
        );

        const onDeleteExpense = () => {
            Alert.alert(
                "Are you sure you want to delete this expense?",
                "This expense will also be deleted for anyone else invited.",
                [
                    { text: "Yes", onPress: () => void _expenseManager.deleteExpense(data.id) },
                    { text: "No", style: "cancel" },
                ],
            );
        };

        const onLongPress = () => {
            if (showLongPressMenu) {
                setActionsVisible(true);
            }
        };

        const defaultActions: ButtonProps[] = [
            {
                label: "Add to Group",
                onPress: () => onExpenseSelectedForGroupAdd?.(data.id),
                disabled: !onExpenseSelectedForGroupAdd || data.children.length > 0,
            },
            {
                label: "Remove from Group",
                onPress: () => onExpenseSelectedForGroupRemove?.(data.id),
                disabled: !onExpenseSelectedForGroupRemove,
            },
            {
                label: "Delete",
                onPress: () => onDeleteExpense(),
            },
            { label: "Cancel", onPress: () => setActionsVisible(false) },
        ];

        return (
            <TouchableOpacity disabled={!!!onPress} onPress={() => onPress?.(data.id)} onLongPress={onLongPress}>
                <View style={[styles.container]}>
                    <View style={styles.rowContainer}>
                        <View style={styles.leftBox}>
                            <Location width={iconSize} height={iconSize} fill={Colors.textColor} />
                        </View>

                        <View style={styles.rightBox}>
                            <Text bodyBold color={Colors.textColor}>
                                {data.name}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.rowContainer}>
                        <View style={styles.leftBox}>
                            <Calendar width={iconSize} height={iconSize} fill={Colors.textColor} />
                        </View>
                        <View style={styles.rightBox}>
                            <Text subtext color={Colors.textColor}>
                                {data.transactionDate
                                    .toLocaleString(Locale, DATE_OPTIONS)
                                    .replace(/\d{2}:\d{2}:\d{2}/, "")}
                            </Text>
                        </View>
                    </View>

                    {!hidePeople && (
                        <View style={styles.rowContainer}>
                            <View style={styles.leftBox}>
                                <People width={iconSize} height={iconSize} fill={Colors.textColor} />
                            </View>
                            <View style={styles.rightBox}>
                                <PeopleIconList expense={data} />
                            </View>
                        </View>
                    )}

                    <View style={styles.rowContainer}>
                        <View style={styles.leftBox}>
                            <Price width={iconSize} height={iconSize} fill={Colors.textColor} />
                        </View>
                        <View style={styles.rightBox}>
                            <Text subtext color={Colors.textColor}>
                                ${data.groupTotal.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {balance.hasPayer && balance.balance !== 0 && (
                        <View style={[styles.rowContainer, { marginTop: 4 }]}>
                            <View style={styles.leftBox}>
                                <Exchange width={iconSize} height={iconSize} fill={Colors.textColor} />
                            </View>
                            <View style={styles.rightBox}>
                                <Text subtext color={Colors.textColor}>
                                    {balance.balance < 0
                                        ? `You owe ${balance.payerName} ${format(-balance.balance)}`
                                        : `You're owed ${format(balance.balance)}`}
                                </Text>
                            </View>
                        </View>
                    )}

                    {showSelectionProgress && (
                        <View style={[styles.rowContainer, { marginTop: 4 }]}>
                            <View style={styles.leftBox}>
                                <Select width={iconSize} height={iconSize} fill={Colors.textColor} />
                            </View>
                            <View style={styles.rightBox}>
                                <ItemSelectionProgressBar expense={data} />
                            </View>
                        </View>
                    )}
                </View>

                <ActionSheet
                    useNativeIOS
                    cancelButtonIndex={defaultActions.filter((i) => !i.disabled).length - 1}
                    destructiveButtonIndex={0}
                    options={defaultActions.filter((i) => !i.disabled)}
                    visible={actionsVisible}
                    onDismiss={() => setActionsVisible(false)}
                />
            </TouchableOpacity>
        );
    },
);

const styles = StyleSheet.create({
    container: {
        width: "100%",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    rowContainer: {
        marginVertical: 1,
        width: "100%",
        flexDirection: "row",
    },
    leftBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        marginRight: 15,
    },
    rightBox: {
        flex: 8,
        justifyContent: "center",
    },
    peopleContainer: {
        flexDirection: "row",
        marginVertical: 5,
        alignItems: "center",
    },
});
