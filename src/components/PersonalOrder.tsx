import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Alert, ScrollView, Dimensions } from "react-native";
import { IExpenseItem, IExpenseUserDetails, ExpenseItem as ExpenseItemModel } from "@splitsies/shared-models";
import { Text, View } from "react-native-ui-lib/core";
import { ActionSheet, Button, ButtonProps, Colors, Icon, Toast } from "react-native-ui-lib";
import { ExpenseItem } from "./ExpenseItem";
import { lazyInject } from "../utils/lazy-inject";
import { IPriceCalculator } from "../utils/price-calculator/price-calculator-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IVenmoLinker } from "../utils/venmo-linker/venmo-linker-interface";
import { useThemeWatcher } from "../hooks/use-theme-watcher";
import { TouchableOpacity } from "react-native-gesture-handler";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { ITransactionNoteBuilder } from "../utils/transaction-note-builder/transaction-note-builder-interface";
import { IClipboardUtility } from "../utils/clipboard-utility/clipboard-utility-interface";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import Star from "../../assets/icons/star.svg";
import More from "../../assets/icons/more.svg";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";

const _priceCalculator = lazyInject<IPriceCalculator>(IPriceCalculator);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _venmoLinker = lazyInject<IVenmoLinker>(IVenmoLinker);
const _transactionNoteBuilder = lazyInject<ITransactionNoteBuilder>(ITransactionNoteBuilder);
const _clipboardUtility = lazyInject<IClipboardUtility>(IClipboardUtility);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _dimensions = Dimensions.get("window");
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

const icon = _uiConfig.sizes.smallIcon;

type Props = {
    person: IExpenseUserDetails;
    expense: IExpense;
    style?: object;
};

export const PersonalOrder = ({ person, expense, style }: Props): JSX.Element => {
    useThemeWatcher();
    const [actionsVisible, setActionsVisible] = useState<boolean>(false);
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

    const defaultActions: ButtonProps[] = [
        { label: "Remove User", onPress: onRemovePerson },
        { label: "Copy Breakdown to Clipboard", onPress: onCopyPress },
        { label: "Mark as Payer", disabled: !!expense.payers.find((p) => p.userId === person.id), onPress: onSetPayer },
        { label: "Cancel", onPress: () => setActionsVisible(false) },
    ];

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
    }, [expense, person]);

    const onPayPress = (): void => {
        Alert.alert(
            `Pay ${
                expense.payers.length
                    ? expense.users.find((u) => u.id === expense.payers[0].userId)?.givenName + " "
                    : ""
            }the breakdown for ${person.givenName} with Venmo?`,
            "",
            [
                { text: "Yes", onPress: () => _venmoLinker.link("pay", personalExpense) },
                { text: "No", style: "cancel" },
            ],
        );
    };

    const onRequestPress = (): void => {
        Alert.alert(`Request payment with Venmo for ${person.givenName}?`, "", [
            { text: "Yes", onPress: () => _venmoLinker.link("charge", personalExpense) },
            { text: "No", style: "cancel" },
        ]);
    };

    const renderHeader = (): JSX.Element => {
        return (
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <View style={{ display: "flex", flex: 1 }}>
                        {person.isRegistered && <Icon assetName="logoPrimary" size={27} />}
                    </View>
                    <View style={{ display: "flex", flex: 1, alignItems: "flex-end" }}>
                        {expense.payers.find((p) => p.userId === person.id) && (
                            <Star width={icon} height={icon} fill={Colors.primary} />
                        )}
                    </View>
                </View>

                <View style={styles.nameContainer}>
                    <Text body numberOfLines={1} ellipsizeMode={"tail"} color={Colors.textColor}>
                        {person.givenName + (person.familyName ? " " + person.familyName : "")}
                    </Text>
                </View>

                <View style={[styles.iconContainer, { columnGap: 5, justifyContent: "flex-end" }]}>
                    <TouchableOpacity
                        onPress={() => setActionsVisible(true)}
                        // style={{ backgroundColor: Colors.primary, padding: 7, borderRadius: 20 }}
                    >
                        <More width={icon} height={icon} fill={Colors.bgColor} />
                    </TouchableOpacity>
                    {/* <RemovePersonButton person={person} expense={expense} /> */}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { borderColor: Colors.divider }, style]}>
            {renderHeader()}
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

            <Toast
                body
                centerMessage
                swipeable
                style={{ borderRadius: 35, margin: 14 }}
                messageStyle={_styleManager.typography.body}
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
                cancelButtonIndex={3}
                destructiveButtonIndex={0}
                options={defaultActions.filter((a) => !a.disabled)}
                visible={actionsVisible}
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
        borderWidth: 1,
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
        justifyContent: "center",
        width: 35,
        flexGrow: 1,
    },
    icon: {
        backgroundColor: _colorConfiguration.primary,
        borderRadius: 35,
    },
});
