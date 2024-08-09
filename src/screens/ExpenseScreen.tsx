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
import { TutorialTip } from "../components/TutorialTip";

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
            _expenseViewModel.setSelectedChild(undefined);
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
        const item = expense.items.find((i) => i.id === itemId);
        if (!item) return;

        const userIndex = item.owners.findIndex((o) => o.id === _userManager.userId);
        const updatedSelected = userIndex === -1;

        _expenseViewModel.setAwaitingResponse(true);
        _expenseManager.updateSingleItemSelected(expense.id, _userManager.expenseUserDetails, item, updatedSelected);

        if (updatedSelected) {
            item.owners.push(_userManager.expenseUserDetails);
        } else {
            item.owners.splice(userIndex, 1);
        }

        // Update the local state for a smoother UX. The data response from the connection
        // should be the same as what we're updating to
        // setExpense(
        //     new Expense(
        //         expense.id,
        //         expense.name,
        //         expense.transactionDate,
        //         expense.items,
        //         expense.users,
        //         expense.payers,
        //         expense.payerStatuses,
        //         expense.children,
        //     ),
        // );
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
            <TutorialTip group="expense" stepKey="editNameAndDate" placement="bottom">
                <SafeAreaView style={{ marginBottom: 10 }}>
                    <View centerH>
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
            </TutorialTip>

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
                renderItem={({ item, index }) =>
                    index !== 0 ? (
                        <ExpenseItem
                            item={item}
                            style={{ marginVertical: 15 }}
                            showOwners
                            editable={isEditing}
                            onPress={() => setSelectedItem(item)}
                            onSelect={onItemSelected}
                        />
                    ) : (
                        <TutorialTip group="expense" stepKey="selectItem" placement="bottom">
                            <ExpenseItem
                                item={item}
                                style={{ marginVertical: 15 }}
                                showOwners
                                editable={isEditing}
                                onPress={() => setSelectedItem(item)}
                                onSelect={onItemSelected}
                            />
                        </TutorialTip>
                    )
                }
            />

            <View style={styles.footer}>
                <ListSeparator />
                <ExpenseFooter expense={expense} onItemSelected={setSelectedItem} isEditing={isEditing} />
            </View>

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
