import React, { useCallback, useEffect, useState } from "react";
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
import { useObservable } from "../hooks/use-observable";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { Container } from "../components/Container";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { IExpense } from "../models/expense/expense-interface";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { TutorialTip } from "../components/TutorialTip";
import { ExpensePreviewList } from "../components/ExpensePreviewList";
import { ExpenseGroupFooter } from "../components/ExpenseGroupFooter";
import { UserIcon } from "../components/UserIcon";
import Add from "../../assets/icons/add.svg";
import { ExpenseFooter } from "../components/ExpenseFooter";
import { Expense } from "../models/expense/expense";
import { RefreshControl } from "react-native-gesture-handler";

const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    DrawerScreenProps<DrawerParamList, "Home">
>;

export const ExpenseGroupScreen = SpThemedComponent(({ navigation }: Props) => {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [expense, setExpense] = useState<IExpense>(_expenseManager.currentExpense!);
    const [selectedItem, setSelectedItem] = useState<IExpenseItem | null>(null);
    const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
    const isEditing = useObservable(_expenseViewModel.isEditingItems$, false);
    const selectedChild = useObservable<IExpense | undefined>(_expenseViewModel.selectedChild$, undefined);

    useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => e != null)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
        (updated) => {
            _expenseViewModel.setAwaitingResponse(false);
            setExpense(updated);
        },
    );

    useEffect(() => {
        if (selectedChild) {
            _expenseViewModel.setSelectedChild(expense.children.find((e) => e.id === selectedChild.id));
        }
    }, [expense]);

    useEffect(() => {
        _expenseViewModel.onBackPress = onBackPress;
    }, [selectedChild]);

    useFocusEffect(
        useCallback(() => {
            _expenseViewModel.setScreen("Items");
            _expenseViewModel.onBackPress = onBackPress;
        }, []),
    );

    const onBackPress = useCallback(() => {
        if (!selectedChild) {
            _expenseManager.disconnectFromExpense();
            navigation.navigate("RootScreen");
        } else {
            _expenseViewModel.setSelectedChild(undefined);
        }
    }, [_expenseManager, navigation, selectedChild]);

    const onItemSave = useCallback(
        ({ name, price, isProportional }: EditResult) => {
            if (!selectedItem) {
                return;
            }

            _expenseManager.updateItemDetails(
                selectedItem.expenseId,
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
            if (!name || !price || !selectedChild) return;
            _expenseManager.addItem(selectedChild.id, name, price, [], !!isProportional);
            setIsAddingItem(false);
            _expenseViewModel.setAwaitingResponse(true);
        },
        [selectedChild],
    );

    const onItemSelected = (itemId: string): void => {
        const item = expense.children.flatMap((c) => c.items).find((i) => i.id === itemId);
        if (!item) return;

        const userIndex = item.owners.findIndex((o) => o.id === _userManager.userId);
        const updatedSelected = userIndex === -1;

        _expenseManager.updateSingleItemSelected(
            item.expenseId,
            _userManager.expenseUserDetails,
            item,
            updatedSelected,
        );

        if (updatedSelected) {
            item.owners.push(_userManager.expenseUserDetails);
        } else {
            item.owners.splice(userIndex, 1);
        }

        // Update the local state for a smoother UX. The data response from the connection
        // should be the same as what we're updating to
        _expenseManager.updateCurrentExpense(
            new Expense(
                expense.id,
                expense.name,
                expense.transactionDate,
                expense.items,
                expense.users,
                expense.payers,
                expense.payerStatuses,
                expense.children,
            ),
        );
    };

    const onItemDelete = useCallback((): void => {
        const item = expense.children.flatMap((c) => c.items).find((i) => i.id === selectedItem?.id);

        if (!item) {
            setSelectedItem(null);
            return;
        }

        _expenseManager.removeItem(item.expenseId, item);
        setSelectedItem(null);
        _expenseViewModel.setAwaitingResponse(true);
    }, [expense, selectedItem]);

    const onExpenseDateUpdated = (date: Date): void => {
        _expenseManager.updateExpenseTransactionDate(selectedChild?.id ?? expense.id, date);
        _expenseViewModel.setAwaitingResponse(true);
    };

    const onRefresh = () => {
        setRefreshing(true);
        void _expenseManager.refreshCurrentExpense();
        setRefreshing(false);
    }

    return (
        <Container>
            <TutorialTip group="expense" stepKey="editNameAndDate" placement="bottom">
                <SafeAreaView style={{ marginBottom: 10 }}>
                    <View centerH>
                        {selectedChild === undefined ? (
                            <View style={{ flexDirection: "row" }}>
                                {expense.users.map(({ id, givenName }) => (
                                    <UserIcon key={id} letter={givenName[0]} style={{ marginRight: 6 }} />
                                ))}
                            </View>
                        ) : (
                            <DateTimePicker
                                style={_styleManager.typography.letter}
                                color={Colors.textColor}
                                maximumDate={new Date()}
                                dateTimeFormatter={(date) => format(date)}
                                mode="date"
                                value={selectedChild.transactionDate}
                                onChange={onExpenseDateUpdated}
                            />
                        )}
                    </View>
                </SafeAreaView>
            </TutorialTip>

            {selectedChild === undefined ? (
                <ExpensePreviewList
                    onRefresh={onRefresh}
                    hidePeople
                    expenses={expense.children}
                    onExpenseClick={(id) => {
                        _expenseViewModel.setSelectedChild(
                            expense.id === id ? expense : expense.children.find((c) => c.id === id),
                        );
                    }}
                />
            ) : (
                <FlatList
                    style={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    data={selectedChild.items.filter((i) => !i.isProportional)}
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
            )}

            <View style={styles.footer}>
                <ListSeparator />
                {selectedChild ? (
                    <ExpenseFooter expense={selectedChild} isEditing={isEditing} onItemSelected={setSelectedItem} />
                ) : (
                    <ExpenseGroupFooter expense={expense} />
                )}
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
