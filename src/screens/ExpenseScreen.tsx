import React, { useCallback, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { CompositeScreenProps } from "@react-navigation/native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { Container } from "../components/Container";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import ArrowBack from "../../assets/icons/arrow-back.svg";
import Add from "../../assets/icons/add.svg";
import { IExpense } from "../models/expense/expense-interface";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    DrawerScreenProps<DrawerParamList, "Home">
>;

export const ExpenseScreen = SpThemedComponent(({ navigation }: Props) => {
    const expense = useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => e != null)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
        () => setAwaitingResponse(false),
    );
    const [selectedItem, setSelectedItem] = useState<IExpenseItem | null>(null);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
    const [inProgressSelections, setInProgressSelections] = useState<string[]>([]);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const onBackPress = useCallback(() => {
        _expenseManager.disconnectFromExpense();
        navigation.navigate("RootScreen");
    }, [_expenseManager, navigation]);

    const onTitleSave = ({ name }: EditResult) => {
        _expenseManager.updateExpenseName(expense.id, name ?? "");
        setEditingTitle(false);
        setAwaitingResponse(true);
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
            setAwaitingResponse(true);
        },
        [expense, selectedItem],
    );

    const onItemAdded = useCallback(
        ({ name, price, isProportional }: EditResult) => {
            if (!name || !price) return;
            _expenseManager.addItem(expense.id, name, price, [], !!isProportional);
            setIsAddingItem(false);
            setAwaitingResponse(true);
        },
        [expense],
    );

    const onItemSelected = useCallback(
        (itemId: string): void => {
            const itemIndex = inProgressSelections.indexOf(itemId);

            if (itemIndex === -1) {
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

        _expenseManager.removeItem(expense.id, expense.items[itemIndex]);
        setSelectedItem(null);
        setAwaitingResponse(true);
    }, [expense, selectedItem]);

    const onSelectAction = (): void => {
        const isStartingSelection = !isSelecting;
        console.log("ayo");

        if (isStartingSelection) {
            // if we're starting selection, populate the in progress selections with current selections
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
        const user = expense.users.find((u) => u.id === userId);
        if (!user) return;
        _expenseManager.updateItemSelections(expense.id, user, selectedItemIds);
        setAwaitingResponse(true);
    };

    const onExpenseDateUpdated = (date: Date): void => {
        _expenseManager.updateExpenseTransactionDate(expense.id, date);
        setAwaitingResponse(true);
    };

    return (
        <Container>
            <SafeAreaView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBackPress}>
                        <ArrowBack width={_uiConfig.sizes.icon} height={_uiConfig.sizes.icon} fill={Colors.textColor} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onSelectAction}>
                        <View flex row centerV style={{ columnGap: 10 }}>
                            <ActivityIndicator animating={awaitingResponse} hidesWhenStopped color={Colors.textColor} />
                            <Text bodyBold color={Colors.textColor}>
                                {!isSelecting ? "Select" : "Done"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View centerH>
                    <TouchableOpacity onPress={() => setEditingTitle(!editingTitle)}>
                        <Text letterHeading color={Colors.textColor} style={styles.headerLabel}>
                            {expense.name}
                        </Text>
                    </TouchableOpacity>

                    <DateTimePicker
                        letter
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
                        selected={inProgressSelections.includes(item.id)}
                        selectable={isSelecting}
                        onPress={() => setSelectedItem(item)}
                        onSelect={onItemSelected}
                    />
                )}
            />

            <View style={styles.footer}>
                <ListSeparator />
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
