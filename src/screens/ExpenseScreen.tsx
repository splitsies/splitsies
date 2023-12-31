import React, { useCallback, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lazyInject } from "../utils/lazy-inject";
import { DrawerParamList, ExpenseParamList, RootStackScreenParams } from "./root-stack-screen-params";
import { Observable, filter } from "rxjs";
import { IExpense, IExpenseItem } from "@splitsies/shared-models";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { View, TouchableOpacity, Text } from "react-native-ui-lib/core";
import { Icon } from "react-native-ui-lib";
import { format } from "../utils/format-date";
import { ExpenseItem } from "../components/ExpenseItem";
import { EditModal } from "../components/EditModal";
import { EditResult } from "../models/edit-result";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { ListSeparator } from "../components/ListSeparator";
import { ExpenseFooter } from "../components/ExpenseFooter";
import { useObservable } from "../hooks/use-observable";
import { CompositeScreenProps } from "@react-navigation/native";
import { DrawerScreenProps } from "@react-navigation/drawer";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackScreenParams>,
    DrawerScreenProps<DrawerParamList, "Home">
>;

export const ExpenseScreen = ({ navigation }: Props) => {
    const expense = useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => e != null)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
    );
    const expenseUsers = useObservable(_expenseManager.currentExpenseUsers$, []);

    const [selectedItem, setSelectedItem] = useState<IExpenseItem | null>(null);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
    const [inProgressSelections, setInProgressSelections] = useState<string[]>([]);

    const onBackPress = useCallback(() => {
        _expenseManager.disconnectFromExpense();
        navigation.navigate("RootScreen");
    }, [_expenseManager, navigation]);

    const onTitleSave = ({ name }: EditResult) => {
        const updated = { ...expense, name } as IExpense;
        void _expenseManager.updateExpense(updated);
        setEditingTitle(false);
    };

    const onItemSave = useCallback(
        ({ name, price, isProportional }: EditResult) => {
            const updatedItem = { ...selectedItem, name, price, isProportional } as IExpenseItem;
            if (!selectedItem) {
                return;
            }

            const itemIndex = expense.items.indexOf(selectedItem);
            if (itemIndex === -1) {
                expense.items.push(updatedItem);
            } else {
                expense.items[itemIndex] = updatedItem;
            }

            void _expenseManager.updateExpense(expense);
            setSelectedItem(null);
        },
        [expense, selectedItem],
    );

    const onItemAdded = useCallback(
        ({ name, price, isProportional }: EditResult) => {
            if (!name || !price) {
                return;
            }

            void _expenseManager.addItemToExpense(expense.id, name, price, [], !!isProportional);
            setIsAddingItem(false);
        },
        [expense],
    );

    const onItemSelected = useCallback(
        (itemId: string): void => {
            const itemIndex = inProgressSelections.indexOf(itemId);

            if (itemIndex === -1) {
                inProgressSelections.push(itemId);
                setInProgressSelections([...inProgressSelections, itemId]);
            } else {
                setInProgressSelections(inProgressSelections.filter((id) => id !== itemId));
            }
        },
        [inProgressSelections],
    );

    const onItemDelete = useCallback((): void => {
        const itemIndex = expense.items.findIndex((i) => i.id === selectedItem?.id);

        if (itemIndex === -1) {
            setSelectedItem(null);
            return;
        }

        expense.items.splice(itemIndex, 1);
        void _expenseManager.updateExpense(expense);
        setSelectedItem(null);
    }, [expense, selectedItem]);

    const onSelectAction = (): void => {
        const isStartingSelection = !isSelecting;

        if (isStartingSelection) {
            const userExpenseIds = expense.items
                .map((i) => (i.owners.find((u) => u.id === _userManager.userId) ? i.id : ""))
                .filter((i) => !!i);

            setInProgressSelections(userExpenseIds);
        } else {
            updateExpenseItemOwners(_userManager.userId, inProgressSelections);
            setInProgressSelections([]);
        }

        setIsSelecting(!isSelecting);
    };

    const updateExpenseItemOwners = (userId: string, selectedItemIds: string[]): void => {
        for (const item of expense.items) {
            const idIndex = item.owners.findIndex((u) => u.id === userId);
            const userHasItem = idIndex !== -1;

            if (userHasItem && !selectedItemIds.includes(item.id)) {
                item.owners.splice(idIndex, 1);
            } else if (!userHasItem && selectedItemIds.includes(item.id)) {
                item.owners.push(expenseUsers.find((u) => u.id === userId)!);
            }
        }
        void _expenseManager.updateExpense(expense);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBackPress}>
                    <Icon assetName="arrowBack" size={27} />
                </TouchableOpacity>

                <TouchableOpacity onPress={onSelectAction}>
                    <Text bodyBold>{!isSelecting ? "Select" : "Done"}</Text>
                </TouchableOpacity>
            </View>

            <View centerH>
                <TouchableOpacity onPress={() => setEditingTitle(!editingTitle)}>
                    <Text heading>{expense.name}</Text>
                </TouchableOpacity>
                <Text subtext>{format(expense.transactionDate)}</Text>
            </View>

            <FlatList
                style={styles.list}
                data={expense.items.filter((i) => !i.isProportional)}
                ItemSeparatorComponent={ListSeparator}
                ListFooterComponent={
                    <TouchableOpacity onPress={() => setIsAddingItem(true)}>
                        <View>
                            <ListSeparator />
                            <View style={{ width: "100%", marginVertical: 20, alignItems: "center" }}>
                                <Icon assetName="add" size={25} tintColor="black" />
                            </View>
                        </View>
                    </TouchableOpacity>
                }
                renderItem={({ item }) => (
                    <ExpenseItem
                        item={item}
                        style={{ marginVertical: 15 }}
                        showOwners
                        selected={inProgressSelections.includes(item.id)}
                        selectable={isSelecting}
                        onPress={() => setSelectedItem(item)}
                        onSelect={onItemSelected}
                    />
                )}
            />

            <View style={styles.footer}>
                <ExpenseFooter expense={expense} onItemSelected={setSelectedItem} />
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
        </SafeAreaView>
    );
};

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
    itemContainer: {
        justifyContent: "space-between",
    },
    list: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
    },
    footer: {
        display: "flex",
        borderTopColor: _colorConfiguration.greyFont,
        borderTopWidth: 1,
        paddingTop: 10,
        rowGap: 10,
    },
});
