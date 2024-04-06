import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import { IExpenseItem, IExpenseUserDetails, ExpenseItem as ExpenseItemModel } from "@splitsies/shared-models";
import { Text, View } from "react-native-ui-lib/core";
import { Button, Colors, Icon, Toast } from "react-native-ui-lib";
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
import { RemovePersonButton } from "./RemovePersonButton";
import Copy from "../../assets/icons/copy.svg";
import { IExpense } from "../models/expense/expense-interface";

const _priceCalculator = lazyInject<IPriceCalculator>(IPriceCalculator);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _venmoLinker = lazyInject<IVenmoLinker>(IVenmoLinker);
const _transactionNoteBuilder = lazyInject<ITransactionNoteBuilder>(ITransactionNoteBuilder);
const _clipboardUtility = lazyInject<IClipboardUtility>(IClipboardUtility);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);

const icon = _uiConfig.sizes.smallIcon;

type Props = {
    person: IExpenseUserDetails;
    expense: IExpense;
    style?: object;
};

export const PersonalOrder = ({ person, expense, style }: Props): JSX.Element => {
    useThemeWatcher();
    const [personalExpense, setPersonalExpense] = useState<IExpense>(
        _priceCalculator.calculatePersonalExpense(person.id, expense),
    );

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
        Alert.alert(`Open venmo?`, "", [
            { text: "Yes", onPress: () => _venmoLinker.link("pay", personalExpense) },
            { text: "No", style: "cancel" },
        ]);
    };

    const onRequestPress = (): void => {
        Alert.alert(`Open venmo?`, "", [
            { text: "Yes", onPress: () => _venmoLinker.link("charge", personalExpense) },
            { text: "No", style: "cancel" },
        ]);
    };

    const onCopyPress = useCallback((): void => {
        _clipboardUtility.copyToClipboard(_transactionNoteBuilder.build(personalExpense));
        setToastVisible(true);
    }, [personalExpense]);

    const renderHeader = (): JSX.Element => {
        return (
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    {person.isRegistered && <Icon assetName="logoPrimary" size={27} />}
                </View>

                <View style={styles.nameContainer}>
                    <Text body numberOfLines={1} ellipsizeMode={"tail"} color={Colors.textColor}>
                        {person.givenName + (person.familyName ? " " + person.familyName : "")}
                    </Text>
                </View>

                <View
                    style={[styles.iconContainer, { flexDirection: "row", columnGap: 5, justifyContent: "flex-end" }]}
                >
                    <TouchableOpacity
                        onPress={onCopyPress}
                        style={{ backgroundColor: Colors.primary, padding: 7, borderRadius: 20 }}
                    >
                        <Copy width={icon} height={icon} fill={Colors.bgColor} />
                    </TouchableOpacity>
                    <RemovePersonButton person={person} expense={expense} />
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { borderColor: Colors.textColor }, style]}>
            {renderHeader()}
            <ScrollView style={styles.orderContainer}>
                {personalExpense.items
                    .filter((i) => !i.isProportional)
                    .map((item) => (
                        <ExpenseItem item={item} key={item.id} onPress={() => {}} />
                    ))}
            </ScrollView>

            <View style={{ borderTopWidth: 0.5, borderTopColor: _colorConfiguration.greyFont, paddingTop: 5 }}>
                <ExpenseItem item={subtotalItem} key={"subtotal"} onPress={() => {}} />
                {personalExpense.items
                    .filter((i) => i.isProportional)
                    .map((item) => (
                        <ExpenseItem item={item} key={item.id} onPress={() => {}} />
                    ))}
                <ExpenseItem item={totalItem} key={"total"} onPress={() => {}} />
            </View>
            <View style={styles.buttonContainer}>
                <Button body bg-primary borderless style={styles.button} labelStyle={{color: "black"}} label="Pay" onPress={onPayPress} />
                <Button body bg-primary borderless style={styles.button} labelStyle={{color: "black"}} label="Request" onPress={onRequestPress} />
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
                message="Note copied to clipboard"
                onDismiss={() => {
                    setToastVisible(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        alignSelf: "center",
        borderRadius: 25,
        borderWidth: 0.5,
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
        justifyContent: "space-between",
        alignItems: "flex-end",
        width: "100%",
        marginTop: 5,
    },
    button: {
        minWidth: 100
    },
    iconContainer: {
        overflow: "visible",
        alignItems: "center",
        justifyContent: "center",
        width: 35,
        height: 35,
    },
    icon: {
        backgroundColor: _colorConfiguration.primary,
        borderRadius: 35,
    },
});
