import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Alert, ScrollView, Dimensions } from "react-native";
import { IExpenseItem, IExpenseUserDetails, ExpenseItem as ExpenseItemModel } from "@splitsies/shared-models";
import { View } from "react-native-ui-lib/core";
import { ActionSheet, Button, ButtonProps, Colors, Icon, Toast } from "react-native-ui-lib";
import { ExpenseItem } from "./ExpenseItem";
import { lazyInject } from "../utils/lazy-inject";
import { IPriceCalculator } from "../utils/price-calculator/price-calculator-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IVenmoLinker } from "../utils/venmo-linker/venmo-linker-interface";
import { useThemeWatcher } from "../hooks/use-theme-watcher";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { ITransactionNoteBuilder } from "../utils/transaction-note-builder/transaction-note-builder-interface";
import { IClipboardUtility } from "../utils/clipboard-utility/clipboard-utility-interface";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { useComputed } from "../hooks/use-computed";
import { IBalanceCalculator } from "../utils/balance-calculator/balance-calculator-interface";
import { BalanceResult } from "../models/balance-result";
import { ISettingsManager } from "../managers/settings-manager/settings-manager-interface";
import { TutorialTip } from "./TutorialTip";
import { CardHeader } from "./CardHeader";
import CheckCircle from "../../assets/icons/check-circle.svg";

const _priceCalculator = lazyInject<IPriceCalculator>(IPriceCalculator);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _venmoLinker = lazyInject<IVenmoLinker>(IVenmoLinker);
const _transactionNoteBuilder = lazyInject<ITransactionNoteBuilder>(ITransactionNoteBuilder);
const _clipboardUtility = lazyInject<IClipboardUtility>(IClipboardUtility);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _dimensions = Dimensions.get("window");
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _balanceCalculator = lazyInject<IBalanceCalculator>(IBalanceCalculator);
const _settingsManager = lazyInject<ISettingsManager>(ISettingsManager);

type Props = {
    person: IExpenseUserDetails;
    expense: IExpense;
    isSelectedPerson: boolean;
    style?: object;
};

export const PersonalOrder = ({ person, expense, style, isSelectedPerson }: Props): JSX.Element => {
    useThemeWatcher();

    const payer = useComputed<boolean, [IExpense]>(
        ([expense]) => !!(expense as IExpense).payers.find((p) => p.userId === person.id),
        [expense],
    );
    const settled = useComputed<boolean, [IExpense]>(
        ([expense]) => !!(expense as IExpense).payerStatuses.find((s) => s.userId === person.id)?.settled,
        [expense],
    );
    const balance = useComputed<BalanceResult, [IExpense, IExpenseUserDetails]>(
        ([expense, person]) => _balanceCalculator.calculate(expense, person.id),
        [expense, person],
    );

    const [personalExpense, setPersonalExpense] = useState<IExpense>(
        _priceCalculator.calculatePersonalExpense(person.id, expense),
    );

    const onCopyPress = useCallback((): void => {
        _clipboardUtility.copyToClipboard(_transactionNoteBuilder.build(personalExpense));
        setActionsVisible(false);
        setToastVisible(true);
    }, [personalExpense]);

    const onSetPayer = useCallback((): void => {
        void _expenseManager.requestSetExpensePayers(expense.id, person.id);
        setActionsVisible(false);
    }, [expense, person]);

    const onRemovePerson = (): void => {
        Alert.alert(`Remove Person?`, "Any item selections will be reverted. Do you want to continue?", [
            {
                text: "Yes",
                onPress: () => {
                    void _expenseManager.requestRemoveUserFromExpense(person.id, expense.id);
                    setActionsVisible(false);
                },
            },
            { text: "No", style: "cancel" },
        ]);
    };

    const onPayPress = (): void => {
        Alert.alert(
            `Pay ${
                expense.payers.length
                    ? expense.users.find((u) => u.id === expense.payers[0].userId)?.givenName + " "
                    : ""
            }the breakdown for ${person.givenName} with Venmo?`,
            "",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        _venmoLinker.link("pay", personalExpense);
                        if (_settingsManager.markPaidOnPay && !settled) {
                            onTogglePayerStatus();
                        }
                    },
                },
                { text: "No", style: "cancel" },
            ],
        );
    };

    const onRequestPress = (): void => {
        Alert.alert(`Request payment with Venmo for ${person.givenName}?`, "", [
            {
                text: "Yes",
                onPress: () => {
                    _venmoLinker.link("charge", personalExpense);
                    if (_settingsManager.markPaidOnRequest && !settled) {
                        onTogglePayerStatus();
                    }
                },
            },
            { text: "No", style: "cancel" },
        ]);
    };

    const onTogglePayerStatus = (): void => {
        void _expenseManager.requestSetExpensePayerStatus(expense.id, person.id, !settled);
        setActionsVisible(false);
    };

    const defaultActions: ButtonProps[] = [
        { label: "Remove User", onPress: onRemovePerson },
        { label: "Copy Breakdown to Clipboard", onPress: onCopyPress },
        {
            label: "Mark as Payer",
            disabled: payer,
            onPress: onSetPayer,
        },
        {
            label: settled ? "Mark as Unpaid" : "Mark as Paid",
            disabled: expense.payers.length === 0 || payer,
            onPress: onTogglePayerStatus,
        },
        { label: "Cancel", onPress: () => setActionsVisible(false) },
    ];

    const [actionsVisible, setActionsVisible] = useState<boolean>(false);
    const [borderColor, setBorderColor] = useState<string>(Colors.divider);
    const [subtotalItem, setSubtotalItem] = useState<IExpenseItem>(
        new ExpenseItemModel("", expense.id, "Subtotal", personalExpense.subtotal, [], false, Date.now()),
    );
    const [totalItem, setTotalItem] = useState<IExpenseItem>(
        new ExpenseItemModel("", expense.id, "Total", personalExpense.total, [], false, Date.now()),
    );
    const [toastVisible, setToastVisible] = useState<boolean>(false);

    useEffect(() => {
        const updatedPersonalExpense = _priceCalculator.calculatePersonalExpense(person.id, expense);
        setPersonalExpense(updatedPersonalExpense);
        setSubtotalItem(
            new ExpenseItemModel("", expense.id, "Subtotal", updatedPersonalExpense.subtotal, [], false, Date.now()),
        );

        setTotalItem(
            new ExpenseItemModel("", expense.id, "Total", updatedPersonalExpense.total, [], false, Date.now()),
        );

        if (expense.payers.length === 0 || expense.payers.find((u) => u.userId === person.id)) {
            setBorderColor(Colors.divider);
            return;
        }

        setBorderColor(!settled ? Colors.attention : Colors.primary);
    }, [expense, person, settled]);

    const renderButtons = () => (
        <View style={styles.buttonContainer}>
            <Button
                body
                bg-primary
                borderless
                style={styles.button}
                labelStyle={{ color: "black" }}
                label="Pay"
                onPress={onPayPress}
            />
            <Button
                body
                bg-primary
                borderless
                style={styles.button}
                labelStyle={{ color: "black" }}
                label="Request"
                onPress={onRequestPress}
            />
        </View>
    );

    return (
        <View style={[styles.container, { borderColor }, style]}>
            <CardHeader
                person={person}
                isSelected={isSelectedPerson}
                setActionsVisible={setActionsVisible}
                balance={balance}
                isPayer={payer}
                iconContent={() => payer
                    ? <Icon assetName="logoPrimary" size={_uiConfig.sizes.largeIcon} />
                    : settled && (
                        <CheckCircle width={_uiConfig.sizes.icon} height={_uiConfig.sizes.icon} fill={Colors.ready} />
                    )
                }
            />
            <ScrollView style={styles.orderContainer}>
                {personalExpense.items
                    .filter((i) => !i.isProportional)
                    .map((item) => (
                        <ExpenseItem item={item} key={item.id} onPress={() => {}} />
                    ))}
            </ScrollView>

            <View style={{ borderTopWidth: 0.5, borderTopColor: Colors.divider, paddingTop: 5 }}>
                {expense.items.filter((i) => i.isProportional).length > 0 && (
                    <ExpenseItem item={subtotalItem} key={"subtotal"} onPress={() => {}} />
                )}
                {personalExpense.items
                    .filter((i) => i.isProportional)
                    .map((item) => (
                        <ExpenseItem item={item} key={item.id} onPress={() => {}} />
                    ))}
                <ExpenseItem item={totalItem} key={"total"} onPress={() => {}} />
            </View>

            {isSelectedPerson ? (
                <TutorialTip group="people" stepKey="pay">
                    {renderButtons()}
                </TutorialTip>
            ) : (
                renderButtons()
            )}

            <Toast
                body
                centerMessage
                swipeable
                style={{ borderRadius: 35, margin: 14 }}
                messageStyle={{ ..._styleManager.typography.body, color: "black" }}
                visible={toastVisible}
                position={"bottom"}
                autoDismiss={1000}
                backgroundColor={_colorConfiguration.primary}
                message="Breakdown copied to clipboard"
                onDismiss={() => {
                    setToastVisible(false);
                }}
            />

            <ActionSheet
                useNativeIOS
                cancelButtonIndex={defaultActions.filter((a) => !a.disabled).length - 1}
                destructiveButtonIndex={0}
                options={defaultActions.filter((a) => !a.disabled)}
                visible={actionsVisible}
                onDismiss={() => setActionsVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: _dimensions.width - _uiConfig.sizes.carouselPadding,
        height: "100%",
        alignItems: "center",
        alignSelf: "center",
        borderRadius: 30,
        borderWidth: 2,
        padding: 15,
        display: "flex",
    },
    itemContainer: {
        paddingHorizontal: 10,
        marginVertical: 2,
    },
    nameContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: 5,
    },
    orderContainer: {
        flexGrow: 1,
        flex: 1,
        width: "100%",
    },
    individualItemContainer: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        marginVertical: 5,
    },
    buttonContainer: {
        flexDirection: "row",
        columnGap: 25,
        justifyContent: "space-between",
        alignItems: "flex-end",
        width: "100%",
        marginTop: 5,
        paddingHorizontal: 10,
        paddingBottom: 5,
    },
    button: {
        flex: 1,
    },
    iconContainer: {
        overflow: "visible",
        flexDirection: "row",
        alignItems: "center",
        width: 35,
    },
    icon: {
        backgroundColor: _colorConfiguration.primary,
        borderRadius: 35,
    },
});
