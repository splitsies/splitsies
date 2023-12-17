import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import { IExpense, IExpenseItem, IExpenseUserDetails, ExpenseItem as ExpenseItemModel } from "@splitsies/shared-models";
import { Text, View } from "react-native-ui-lib/core";
import { Button, Icon } from "react-native-ui-lib";
import { ExpenseItem } from "./ExpenseItem";
import { lazyInject } from "../utils/lazy-inject";
import { IPriceCalculator } from "../utils/price-calculator/price-calculator-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { IVenmoLinker } from "../utils/venmo-linker/venmo-linker-interface";

const _priceCalculator = lazyInject<IPriceCalculator>(IPriceCalculator);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _venmoLinker = lazyInject<IVenmoLinker>(IVenmoLinker);

type Props = {
    person: IExpenseUserDetails;
    expense: IExpense;
    style?: object;
};

export const PersonalOrder = ({ person, expense, style }: Props): JSX.Element => {
    const [personalExpense, setPersonalExpense] = useState<IExpense>(
        _priceCalculator.calculatePersonalExpense(person.id, expense),
    );

    const [subtotalItem, setSubtotalItem] = useState<IExpenseItem>(
        new ExpenseItemModel("", "Subtotal", personalExpense.subtotal, [], false),
    );

    const [totalItem, setTotalItem] = useState<IExpenseItem>(
        new ExpenseItemModel("", "Total", personalExpense.total, [], false),
    );

    useEffect(() => {
        const updatedPersonalExpense = _priceCalculator.calculatePersonalExpense(person.id, expense);
        setPersonalExpense(updatedPersonalExpense);
        setSubtotalItem(new ExpenseItemModel("", "Subtotal", updatedPersonalExpense.subtotal, [], false));
        setTotalItem(new ExpenseItemModel("", "Total", updatedPersonalExpense.total, [], false));
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

    const renderHeader = (): JSX.Element => {
        return (
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    {person.isRegistered && <Icon assetName="logoPrimary" size={35} />}
                </View>

                <View style={styles.nameContainer}>
                    <Text body numberOfLines={1} ellipsizeMode={"tail"}>
                        {person.givenName + (person.familyName ? " " + person.familyName : "")}
                    </Text>
                </View>

                <View style={styles.iconContainer} />
            </View>
        );
    };

    return (
        <View style={{ ...styles.container, ...style }}>
            {renderHeader()}
            <ScrollView style={{ width: "100%" }}>
                {personalExpense.items
                    .filter((i) => !i.isProportional)
                    .map((item) => (
                        <ExpenseItem item={item} key={item.id} onPress={() => {}} />
                    ))}
                <ExpenseItem item={subtotalItem} key={"subtotal"} onPress={() => {}} />
                {personalExpense.items
                    .filter((i) => i.isProportional)
                    .map((item) => (
                        <ExpenseItem item={item} key={item.id} onPress={() => {}} />
                    ))}
                <ExpenseItem item={totalItem} key={"total"} onPress={() => {}} />
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button body bg-primary borderless style={styles.button} label="Pay" onPress={onPayPress} />
                <Button body bg-primary borderless style={styles.button} label="Request" onPress={onRequestPress} />
            </View>
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
        borderColor: _colorConfiguration.black,
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
        padding: 10,
    },
    orderContainer: {
        flex: 2,
        height: "100%",
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
        flex: 1,
    },
    button: {
        width: 100,
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
