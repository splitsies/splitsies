import React, { useCallback, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lazyInject } from "../utils/lazy-inject";
import { RootStackScreenParams } from "./root-stack-screen-params";
import { Subscription, filter } from "rxjs";
import { IExpense, IExpenseItem } from "@splitsies/shared-models";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { View, TouchableOpacity, Text } from "react-native-ui-lib/core";
import { ActionBar, Icon } from "react-native-ui-lib";
import { format } from "../utils/format-date";
import { ExpenseItem } from "../components/ExpenseItem";
import { EditModal } from "../components/EditModal";
import { EditResult } from "../models/edit-result";
import { useInitialize } from "../hooks/use-initialize";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = NativeStackScreenProps<RootStackScreenParams, "ExpenseScreen">;

export const ExpenseScreen = ({ navigation }: Props) => {
    const [expense, setExpense] = useState<IExpense>(_expenseManager.currentExpense!);
    const [selectedItem, setSelectedItem] = useState<IExpenseItem | null>(null);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
    const [inProgressSelections, setInProgressSelections] = useState<string[]>([]);

    useInitialize(() => {
        const subscription = new Subscription();

        subscription.add(
            _expenseManager.currentExpense$.pipe(filter((e) => !!e)).subscribe({
                next: (expense) => setExpense(expense!),
            }),
        );

        return () => subscription.unsubscribe();
    });

    const onBackPress = useCallback(() => {
        _expenseManager.disconnectFromExpense();
        navigation.goBack();
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
                expense.items[itemIndex] = updatedItem
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

    const onSelectAction = (): void => {
        if (!isSelecting) {
            const userExpenseIds = expense.items
                .map((i) => (i.owners.includes(_userManager.userId) ? i.id : ""))
                .filter((i) => !!i);

            setInProgressSelections(userExpenseIds);
        } else {
            for (const item of expense.items) {
                const idIndex = item.owners.indexOf(_userManager.userId);

                if (idIndex !== -1 && !inProgressSelections.includes(item.id)) {
                    item.owners.splice(idIndex, 1);
                } else if (idIndex === -1 && inProgressSelections.includes(item.id)) {
                    item.owners.push(_userManager.userId);
                }
            }

            setInProgressSelections([]);
            void _expenseManager.updateExpense(expense);
        }

        setIsSelecting(!isSelecting);
    };

    const HeaderComponent = () => {
        return (
            <View centerH marginB-15>
                <TouchableOpacity onPress={() => setEditingTitle(!editingTitle)}>
                    <Text heading>{expense.name}</Text>
                </TouchableOpacity>
                <Text subtext>{format(expense.transactionDate)}</Text>
            </View>
        );
    };

    const Separator = () => {
        return (
            <View style={{ width: "100%" }} flex centerH>
                <View style={styles.separator} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View padding-5>
                <TouchableOpacity onPress={() => onBackPress()}>
                    <Icon assetName="arrowBack" size={35} />
                </TouchableOpacity>
            </View>

            <HeaderComponent />

            <FlatList
                style={styles.list}
                data={expense.items.filter(i => !i.isProportional)}
                ItemSeparatorComponent={Separator}
                renderItem={({ item }) => (
                    <ExpenseItem
                        item={item}
                        showOwners
                        selected={inProgressSelections.includes(item.id)}
                        selectable={isSelecting}
                        onPress={() => setSelectedItem(item)}
                        onSelect={onItemSelected}
                    />
                )}
            />

            <View style={styles.footer}>
                <ExpenseItem
                    item={{ name: "Subtotal", price: expense.subtotal, owners: [] } as unknown as IExpenseItem}
                />

                {expense.items
                    .filter(i => i.isProportional)
                    .map((pi) => (
                        <ExpenseItem
                            key={pi.id}
                            item={pi}
                            onPress={() => setSelectedItem(pi)}
                        />
                ))}

                <ExpenseItem item={{ name: "Total", price: expense.total, owners: [] } as unknown as IExpenseItem} />

                <ActionBar
                    style={{ backgroundColor: "rgba(0,0,0,0)" }}
                    keepRelative
                    useSafeArea
                    centered
                    actions={[
                        { label: isSelecting ? "Done" : "Select", onPress: onSelectAction },
                        { label: "Add", onPress: () => setIsAddingItem(true) },
                    ]}
                />
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
    separator: {
        height: 1,
        width: "100%",
        backgroundColor: _colorConfiguration.greyFont,
        marginTop: 10,
        marginBottom: 10,
        opacity: 0.33,
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
        marginHorizontal: 10,
    },
});
