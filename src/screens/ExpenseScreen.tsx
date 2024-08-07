import React, { useCallback, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import { lazyInject } from "../utils/lazy-inject";
import { DrawerParamList, RootStackParamList } from "../types/params";
import { Observable, filter } from "rxjs";
import { IExpenseItem } from "@splitsies/shared-models";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { View, TouchableOpacity, Text } from "react-native-ui-lib/core";
import { Colors, DateTimePicker } from "react-native-ui-lib";
import { format } from "../utils/format-date";
import { ExpenseItem } from "../components/ExpenseItem";
import { EditModal } from "../components/EditModal";
import { EditResult } from "../models/edit-result";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { ListSeparator } from "../components/ListSeparator";
import { ExpenseFooter } from "../components/ExpenseFooter";
import { useObservable } from "../hooks/use-observable";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { Container } from "../components/Container";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import Add from "../../assets/icons/add.svg";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { Expense } from "../models/expense/expense";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    DrawerScreenProps<DrawerParamList, "Home">
>;

export const ExpenseScreen = SpThemedComponent(({ navigation }: Props) => {
    const [expense, setExpense] = useState<IExpense>(_expenseManager.currentExpense!);
    const [selectedItem, setSelectedItem] = useState<IExpenseItem | null>(null);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
    const isEditing = useObservable(_expenseViewModel.isEditingItems$, false);

    useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => e != null)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
        (updated) => {
            _expenseViewModel.setAwaitingResponse(false);
            setExpense(updated);
        },
    );

    useFocusEffect(
        useCallback(() => {
            _expenseViewModel.setScreen("Items");
            _expenseViewModel.onBackPress = onBackPress;
        }, []),
    );

    const onBackPress = useCallback(() => {
        _expenseManager.disconnectFromExpense();
        navigation.navigate("RootScreen");
    }, [_expenseManager, navigation]);

    const onTitleSave = ({ name }: EditResult) => {
        _expenseManager.updateExpenseName(expense.id, name ?? "");
        setEditingTitle(false);
        _expenseViewModel.setAwaitingResponse(true);
    };

    const onItemSave = useCallback(
        ({ name, price, isProportional }: EditResult) => {
            if (!selectedItem) {
                return;
            }

            _expenseManager.updateItemDetails(
                expense.id,
                selectedItem,
                name ?? selectedItem.name,
                price ?? selectedItem.price,
                isProportional ?? selectedItem.isProportional,
            );

            setSelectedItem(null);
            _expenseViewModel.setAwaitingResponse(true);
        },
        [expense, selectedItem],
    );

    const onItemAdded = useCallback(
        ({ name, price, isProportional }: EditResult) => {
            if (!name || !price) return;
            _expenseManager.addItem(expense.id, name, price, [], !!isProportional);
            setIsAddingItem(false);
            _expenseViewModel.setAwaitingResponse(true);
        },
        [expense],
    );

    const onItemSelected = (itemId: string): void => {
        const selectedItems = expense.items
            .filter((item) => item.owners.some((o) => o.id === _userManager.userId))
            .map((item) => item.id);

        const itemIndex = selectedItems.findIndex((id) => id === itemId);
        if (itemIndex === -1) {
            selectedItems.push(itemId);
        } else {
            selectedItems.splice(itemIndex, 1);
        }

        // Due to socket performance, managing selections locally first gives the illusion of
        // the selection persisting sooner to avoid additional attempts
        for (const item of expense.items) {
            const itemSelected = selectedItems.includes(item.id);
            const userOwnsItem = !!item.owners.find((o) => o.id === _userManager.userId);

            if (itemSelected && !userOwnsItem) {
                item.owners.push(_userManager.expenseUserDetails);
            } else if (!itemSelected && userOwnsItem) {
                const index = item.owners.findIndex((o) => o.id === _userManager.userId);
                if (index !== -1) item.owners.splice(index, 1);
            } else {
                continue;
            }
        }

        setExpense(
            new Expense(
                expense.id,
                expense.name,
                expense.transactionDate,
                expense.items,
                expense.users,
                expense.payers,
            ),
        );

        updateExpenseItemOwners(_userManager.userId, selectedItems);
    };

    const onItemDelete = useCallback((): void => {
        const itemIndex = expense.items.findIndex((i) => i.id === selectedItem?.id);

        if (itemIndex === -1) {
            setSelectedItem(null);
            return;
        }

        _expenseManager.removeItem(expense.id, expense.items[itemIndex]);
        setSelectedItem(null);
        _expenseViewModel.setAwaitingResponse(true);
    }, [expense, selectedItem]);

    const updateExpenseItemOwners = (userId: string, selectedItemIds: string[]): void => {
        const user = expense.users.find((u) => u.id === userId);
        if (!user) return;
        _expenseManager.updateItemSelections(expense.id, user, selectedItemIds);
        _expenseViewModel.setAwaitingResponse(true);
    };

    const onExpenseDateUpdated = (date: Date): void => {
        _expenseManager.updateExpenseTransactionDate(expense.id, date);
        _expenseViewModel.setAwaitingResponse(true);
    };

    return (
        <Container>
            <SafeAreaView style={{ marginBottom: 10 }}>
                <View centerH>
                    <TouchableOpacity onPress={() => setEditingTitle(!editingTitle)}>
                        <Text letterHeading color={Colors.textColor} style={styles.headerLabel}>
                            {expense.name}
                        </Text>
                    </TouchableOpacity>

                    <DateTimePicker
                        style={_styleManager.typography.letter}
                        color={Colors.textColor}
                        maximumDate={new Date()}
                        dateTimeFormatter={(date) => format(date)}
                        mode="date"
                        value={expense.transactionDate}
                        onChange={onExpenseDateUpdated}
                    />
                </View>
            </SafeAreaView>

            <FlatList
                style={styles.list}
                data={expense.items.filter((i) => !i.isProportional)}
                ItemSeparatorComponent={ListSeparator}
                ListFooterComponent={
                    <TouchableOpacity onPress={() => setIsAddingItem(true)}>
                        <View>
                            <ListSeparator />
                            <View style={{ width: "100%", marginVertical: 20, alignItems: "center" }}>
                                <Add
                                    width={_uiConfig.sizes.icon}
                                    height={_uiConfig.sizes.icon}
                                    fill={Colors.textColor}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                }
                renderItem={({ item }) => (
                    <ExpenseItem
                        item={item}
                        style={{ marginVertical: 15 }}
                        showOwners
                        editable={isEditing}
                        onPress={() => setSelectedItem(item)}
                        onSelect={onItemSelected}
                    />
                )}
            />

            <View style={styles.footer}>
                <ListSeparator />
                <ExpenseFooter expense={expense} onItemSelected={setSelectedItem} isEditing={isEditing} />
            </View>

            <EditModal
                visible={editingTitle}
                nameValue={expense.name}
                onSave={onTitleSave}
                onCancel={() => setEditingTitle(false)}
            />

            <EditModal
                visible={!!selectedItem}
                nameValue={selectedItem?.name}
                priceValue={selectedItem?.price}
                onSave={onItemSave}
                proportional={!!selectedItem?.isProportional}
                onCancel={() => setSelectedItem(null)}
                onDelete={() => onItemDelete()}
            />

            <EditModal
                visible={isAddingItem}
                nameValue=""
                priceValue={0}
                onSave={onItemAdded}
                proportional={false}
                onCancel={() => setIsAddingItem(false)}
            />
        </Container>
    );
});

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
        width: "100%",
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 10,
        paddingRight: 15,
        paddingTop: 31,
        width: "100%",
    },
    headerLabel: {
        textAlign: "center",
        minWidth: 200,
        minHeight: 30,
    },
    list: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
    },
    footer: {
        display: "flex",
        rowGap: 10,
        paddingVertical: 10,
    },
});
