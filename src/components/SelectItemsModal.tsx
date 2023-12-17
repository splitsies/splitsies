import React from "react";
import { useCallback, useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import { ListSeparator } from "./ListSeparator";
import { ExpenseItem } from "./ExpenseItem";
import { IExpense, IExpenseUserDetails } from "@splitsies/shared-models";
import { Icon, Modal, Text, TouchableOpacity, View } from "react-native-ui-lib";

type Props = {
    user: IExpenseUserDetails;
    expense: IExpense;
    visible: boolean;
    onClose: (itemIds: string[]) => void;
};

export const SelectItemsModal = ({ user, expense, visible, onClose }: Props): JSX.Element => {
    const [selections, setSelections] = useState<string[]>(
        expense.items.filter((i) => i.owners.some((o) => o.id === user.id)).map((i) => i.id),
    );

    useEffect(() => {
        setSelections(expense.items.filter((i) => i.owners.some((o) => o.id === user.id)).map((i) => i.id));
    }, [expense, user]);

    const onItemSelected = useCallback(
        (id: string) => {
            let newSelections = selections;

            const index = newSelections.findIndex((i) => i === id);
            if (index === -1) {
                newSelections.push(id);
            } else {
                newSelections.splice(index, 1);
            }

            setSelections([...newSelections]);
        },
        [selections],
    );

    return (
        <Modal enableModalBlur visible={visible} animationType="slide">
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.arrowContainer}>
                        <TouchableOpacity onPress={() => onClose(selections)}>
                            <Icon assetName="arrowBack" size={35} />
                        </TouchableOpacity>
                    </View>
                    <Text heading>{user.givenName + " " + user.familyName}</Text>
                    <View style={styles.arrowContainer} />
                </View>
                <View style={styles.body}>
                    <FlatList
                        style={styles.list}
                        data={expense.items.filter((i) => !i.isProportional)}
                        ItemSeparatorComponent={ListSeparator}
                        renderItem={({ item }) => (
                            <ExpenseItem
                                item={item}
                                style={{ marginVertical: 15 }}
                                selectable
                                selected={selections.includes(item.id)}
                                onPress={() => {}}
                                onSelect={onItemSelected}
                            />
                        )}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        rowGap: 10,
        alignItems: "center",
        height: "100%",
        marginHorizontal: 10,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        paddingVertical: 20,
    },
    body: {
        display: "flex",
        flexGrow: 1,
        width: "100%",
    },
    list: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
    },
    arrowContainer: {
        display: "flex",
        height: 50,
        width: 50,
        justifyContent: "center",
        paddingRight: 5,
    },
});
