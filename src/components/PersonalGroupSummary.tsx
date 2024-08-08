import React, { useState, useCallback } from "react";
import { StyleSheet, Alert, Dimensions } from "react-native";
import { IExpenseItem, IExpenseUserDetails, ExpenseItem as ExpenseItemModel } from "@splitsies/shared-models";
import { Text, View } from "react-native-ui-lib/core";
import { ActionSheet, Button, ButtonProps, Colors, Toast } from "react-native-ui-lib";
import { ExpenseItem } from "./ExpenseItem";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { useThemeWatcher } from "../hooks/use-theme-watcher";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { useComputed } from "../hooks/use-computed";
import { IBalanceCalculator } from "../utils/balance-calculator/balance-calculator-interface";
import { TutorialTip } from "./TutorialTip";
import { ListSeparator } from "./ListSeparator";
import { GroupBalanceSection } from "./GroupBalanceSection";
import More from "../../assets/icons/more.svg";
import { CollapseableIndicator } from "./CollapseableIndicator";
import { ITransactionNoteBuilder } from "../utils/transaction-note-builder/transaction-note-builder-interface";
import { IClipboardUtility } from "../utils/clipboard-utility/clipboard-utility-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _dimensions = Dimensions.get("window");
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _balanceCalculator = lazyInject<IBalanceCalculator>(IBalanceCalculator);
const _transactionNoteBuilder = lazyInject<ITransactionNoteBuilder>(ITransactionNoteBuilder);
const _clipboardUtility = lazyInject<IClipboardUtility>(IClipboardUtility);

const icon = _uiConfig.sizes.smallIcon;

type Props = {
    person: IExpenseUserDetails;
    expense: IExpense;
    isSelectedPerson: boolean;
    style?: object;
};

export const PersonalGroupSummary = ({ person, expense, style, isSelectedPerson }: Props): JSX.Element => {
    useThemeWatcher();
    const [allExpanded, setAllExpanded] = useState<boolean>(false);
    const balances = useComputed<Map<string, number>, [IExpense, IExpenseUserDetails]>(
        ([expense, person]) => _balanceCalculator.calculatePersonBreakdown(expense, person.id),
        [expense, person],
    );

    const onCopyPress = useCallback((): void => {
        _clipboardUtility.copyToClipboard(_transactionNoteBuilder.buildForGroupSummary(expense, balances, person.id));
        setActionsVisible(false);
        setToastVisible(true);
    }, [expense, balances, person]);

    const onSectionCopyPress = useCallback((otherId: string): void => {
        _clipboardUtility.copyToClipboard(_transactionNoteBuilder.buildForIndividualSummary(expense, balances, person.id, otherId));
        setActionsVisible(false);
        setToastVisible(true);
    }, [expense, balances, person]);

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
        { label: "Cancel", onPress: () => setActionsVisible(false) },
    ];

    const [actionsVisible, setActionsVisible] = useState<boolean>(false);
    const [toastVisible, setToastVisible] = useState<boolean>(false);


    const totalItem = useComputed<IExpenseItem, [Map<string, number>]>(
        ([balances]) => {
            const netTotal = Array.from(balances.values()).reduce((p, c) => p + c, 0);
            return new ExpenseItemModel("", expense.id, netTotal < 0 ? "Owes" : "Owed", Math.abs(netTotal), [], false, Date.now())
        },
        [balances]);

    const renderHeader = (): JSX.Element => {
        return (
            <View style={{ alignItems: "center" }}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={() => setAllExpanded(!allExpanded)}>
                            <CollapseableIndicator collapsed={!allExpanded} size={_uiConfig.sizes.icon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.nameContainer}>
                        <Text body numberOfLines={1} ellipsizeMode={"tail"} color={Colors.textColor}>
                            {person.givenName + (person.familyName ? " " + person.familyName : "")}
                        </Text>
                    </View>

                    <View style={[styles.iconContainer, { columnGap: 5, justifyContent: "flex-end" }]}>
                        {isSelectedPerson ? (
                            <TutorialTip group="people" stepKey="menu" placement="bottom">
                                <TouchableOpacity onPress={() => setActionsVisible(true)}>
                                    <More width={icon} height={icon} fill={Colors.textColor} />
                                </TouchableOpacity>
                            </TutorialTip>
                        ) : (
                            <TouchableOpacity onPress={() => setActionsVisible(true)}>
                                <More width={icon} height={icon} fill={Colors.textColor} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, style, { borderColor: Colors.divider}]}>
            {renderHeader()}
            <FlatList style={styles.orderContainer}
                data={Array.from(balances.entries())}
                renderItem={({ item: [userId, balance] }) => (
                    <View style={{ marginVertical: 10 }}>
                        <GroupBalanceSection
                            key={userId}
                            expense={expense}
                            userId={userId}
                            balance={balance}
                            person={person}
                            allExpanded={allExpanded}
                            onCopyPress={onSectionCopyPress}
                        />
                    </View>
                )}
                ItemSeparatorComponent={ListSeparator}                
            />



            <View style={{ borderTopWidth: 0.5, borderTopColor: Colors.divider, paddingTop: 5 }}>
                <ExpenseItem item={totalItem} key={"total"} onPress={() => {}} />
            </View>

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