import React, { useCallback, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lazyInject } from "../utils/lazy-inject";
import { RootStackScreenParams } from "./root-stack-screen-params";
import { Subscription, filter } from "rxjs";
import { IExpense, IExpenseItem, IExpenseJoinRequest, IExpenseUserDetails, IUserDto } from "@splitsies/shared-models";
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
import { People } from "../components/People";
import { ExpenseFooter } from "../components/ExpenseFooter";
import { PeopleFooter } from "../components/PeopleFooter";

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
    const [pendingJoinRequests, setPendingJoinRequests] = useState<IExpenseJoinRequest[]>([]);
    const [currentTab, setCurrentTab] = useState<"expense" | "people">("expense");

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

        subscription.add(
            _expenseManager.currentExpenseJoinRequests$.subscribe({
                next: (requests) => setPendingJoinRequests(requests),
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
        if (currentTab === "expense") {
            if (!isSelecting) {
                const userExpenseIds = expense.items
                    .map((i) => (i.owners.find((u) => u.id === _userManager.userId) ? i.id : ""))
                    .filter((i) => !!i);

                setInProgressSelections(userExpenseIds);
            } else {
                updateExpenseItemOwners(_userManager.userId, inProgressSelections);
                setInProgressSelections([]);
            }
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

    const onUserInvited = async (user: IExpenseUserDetails): Promise<void> => {
        let userId = user.id;
        if (!user.isRegistered && !user.id) {
            // Adding a guest user
            const addedUser = await _userManager.requestAddGuestUser(user.givenName, user.familyName, user.phoneNumber);
            userId = addedUser.id;
        }

        if (!user.isRegistered) {
            await _expenseManager.requestAddUserToExpense(userId, expense.id);
            return;
        }

        void _expenseManager.sendExpenseJoinRequest(userId, expense.id);
    };

    const onUserUninvited = async (user: IExpenseUserDetails): Promise<void> => {
        void _expenseManager.removeExpenseJoinRequestForUser(expense.id, user.id);
    };

    const onAddGuest = async (givenName: string, phoneNumber: string): Promise<void> => {
        const user = await _userManager.requestAddGuestUser(givenName, "", phoneNumber);
        return _expenseManager.requestAddUserToExpense(user.id, expense.id);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View paddingH-5 paddingT-20 marginH-10>
                <TouchableOpacity onPress={onBackPress}>
                    <Icon assetName="arrowBack" size={35} />
                </TouchableOpacity>
            </View>

            <View centerH>
                <TouchableOpacity onPress={() => setEditingTitle(!editingTitle)}>
                    <Text heading>{expense.name}</Text>
                </TouchableOpacity>
                <Text subtext>{format(expense.transactionDate)}</Text>
            </View>

            {currentTab === "expense" ? (
                <FlatList
                    style={styles.list}
                    data={expense.items.filter((i) => !i.isProportional)}
                    ItemSeparatorComponent={ListSeparator}
                    ListFooterComponent={
                        <TouchableOpacity onPress={() => setIsAddingItem(true)}>
                            <View>
                                <ListSeparator />
                                <View style={{ width: "100%", marginVertical: 20, alignItems: "center" }}>
                                    <Icon assetName="add" size={25} />
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
            ) : (
                <People
                    people={expenseUsers}
                    expense={expense}
                    updateItemOwners={updateExpenseItemOwners}
                    isSelecting={isSelecting}
                    endSelectingMode={() => setIsSelecting(false)}
                />
            )}

            <View style={styles.footer}>
                {currentTab === "expense" ? (
                    <ExpenseFooter expense={expense} onItemSelected={setSelectedItem} />
                ) : (
                    <PeopleFooter expense={expense} expenseUsers={expenseUsers} />
                )}

                <ActionBar
                    style={{
                        backgroundColor: "rgba(0,0,0,0)",
                        borderTopColor: _colorConfiguration.greyFont,
                        borderTopWidth: 1,
                    }}
                    keepRelative
                    useSafeArea
                    centered
                    actions={[
                        {
                            label: isSelecting ? "Done" : "Select",
                            onPress: onSelectAction,
                            color: _colorConfiguration.black,
                            labelStyle: { fontSize: 13, fontFamily: "Avenir-Roman" },
                        },
                        {
                            label: "Invite",
                            onPress: () => setIsSelectingPeople(true),
                            color: _colorConfiguration.black,
                            labelStyle: { fontSize: 13, fontFamily: "Avenir-Roman" },
                        },
                        {
                            label: currentTab === "people" ? "Items" : "People",
                            onPress: () => setCurrentTab(currentTab === "people" ? "expense" : "people"),
                            color: _colorConfiguration.black,
                            labelStyle: { fontSize: 13, fontFamily: "Avenir-Roman" },
                        },
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
                pendingJoinRequests={pendingJoinRequests}
                expenseUsers={expenseUsers}
                onAddGuest={onAddGuest}
                onCancel={() => setIsSelectingPeople(false)}
                onUserSelectionChanged={onUserInvited}
                onRemoveRequest={onUserUninvited}
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
        rowGap: 10,
    },
});
