import React, { useCallback, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lazyInject } from "../utils/lazy-inject";
import { RootStackScreenParams } from "./root-stack-screen-params";
import { Subscription, filter } from "rxjs";
import { IExpense, IExpenseItem, IExpenseUserDetails, IUserDto } from "@splitsies/shared-models";
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
import { PeopleModal } from "../components/PeopleModal";
import { ListSeparator } from "../components/ListSeparator";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = NativeStackScreenProps<RootStackScreenParams, "ExpenseScreen">;

export const ExpenseScreen = ({ navigation }: Props) => {
    const [expense, setExpense] = useState<IExpense>(_expenseManager.currentExpense!);
    const [expenseUsers, setExpenseUsers] = useState<IExpenseUserDetails[]>([]);
    const [selectedItem, setSelectedItem] = useState<IExpenseItem | null>(null);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
    const [inProgressSelections, setInProgressSelections] = useState<string[]>([]);
    const [isSelectingPeople, setIsSelectingPeople] = useState<boolean>(false);

    useInitialize(() => {
        const subscription = new Subscription();

        subscription.add(
            _expenseManager.currentExpense$.pipe(filter((e) => !!e)).subscribe({
                next: (expense) => setExpense(expense!),
            }),
        );

        subscription.add(
            _expenseManager.currentExpenseUsers$.subscribe({
                next: (users) => setExpenseUsers(users),
            }),
        );

        void _expenseManager.requestUsersForExpense(expense.id);

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
        if (!isSelecting) {
            const userExpenseIds = expense.items
                .map((i) => (i.owners.find((u) => u.id === _userManager.userId) ? i.id : ""))
                .filter((i) => !!i);

            setInProgressSelections(userExpenseIds);
        } else {
            for (const item of expense.items) {
                const idIndex = item.owners.findIndex((u) => u.id === _userManager.userId);

                if (idIndex !== -1 && !inProgressSelections.includes(item.id)) {
                    item.owners.splice(idIndex, 1);
                } else if (idIndex === -1 && inProgressSelections.includes(item.id)) {
                    item.owners.push(_userManager.expenseUserDetails);
                }
            }

            setInProgressSelections([]);
            void _expenseManager.updateExpense(expense);
        }

        setIsSelecting(!isSelecting);
    };

    const onUserSelectionChanged = async (user: IExpenseUserDetails, included: boolean): Promise<void> => {
        let userId = user.id;
        if (included) {
            if (!user.isRegistered && !user.id) {
                // Adding a guest user
                const addedUser = await _userManager.requestAddGuestUser(
                    user.givenName,
                    user.familyName,
                    user.phoneNumber,
                );
                userId = addedUser.id;
            }

            void _expenseManager.requestAddUserToExpense(userId, expense.id);
        } else {
            void _expenseManager.requestRemoveUserFromExpense(userId, expense.id);
        }
    };

    const onAddGuest = async (givenName: string, phoneNumber: string): Promise<void> => {
        const user = await _userManager.requestAddGuestUser(givenName, "", phoneNumber);
        return _expenseManager.requestAddUserToExpense(user.id, expense.id);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View padding-5>
                <TouchableOpacity onPress={() => onBackPress()}>
                    <Icon assetName="arrowBack" size={35} />
                </TouchableOpacity>
            </View>

            <View centerH marginB-15>
                <TouchableOpacity onPress={() => setEditingTitle(!editingTitle)}>
                    <Text heading>{expense.name}</Text>
                </TouchableOpacity>
                <Text subtext>{format(expense.transactionDate)}</Text>
            </View>

            <FlatList
                style={styles.list}
                data={expense.items.filter((i) => !i.isProportional)}
                ItemSeparatorComponent={ListSeparator}
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
                    .filter((i) => i.isProportional)
                    .map((pi) => (
                        <ExpenseItem key={pi.id} item={pi} onPress={() => setSelectedItem(pi)} />
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
                        { label: "Invite", onPress: () => setIsSelectingPeople(true) },
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

            <PeopleModal
                visible={isSelectingPeople}
                expenseUsers={expenseUsers}
                onAddGuest={onAddGuest}
                onCancel={() => setIsSelectingPeople(false)}
                onUserSelectionChanged={onUserSelectionChanged}
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
