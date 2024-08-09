import React, { useCallback } from "react";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import { ListSeparator } from "./ListSeparator";
import { ExpenseItem } from "./ExpenseItem";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { Colors, Modal, Text, TouchableOpacity, View } from "react-native-ui-lib";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { lazyInject } from "../utils/lazy-inject";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";

import ArrowBack from "../../assets/icons/arrow-back.svg";
import { IExpense } from "../models/expense/expense-interface";

const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = {
    user: IExpenseUserDetails;
    expense: IExpense;
    visible: boolean;
    onClose: (itemIds: string[]) => void;
};

export const SelectItemsModal = SpThemedComponent(({ user, expense, visible, onClose }: Props): JSX.Element => {
    const [selections, setSelections] = useState<string[]>(
        user ? expense.items.filter((i) => i.owners.some((o) => o.id === user.id)).map((i) => i.id) : [],
    );

    useEffect(() => {
        const selectedItemIds = user
            ? expense.items.filter((i) => i.owners.some((o) => o.id === user.id)).map((i) => i.id)
            : [];
        setSelections(selectedItemIds);
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
        <Modal
            enableModalBlur
            visible={visible}
            animationType="slide"
            style={{ backgroundColor: Colors.screenBG }}
            presentationStyle="formSheet"
        >
            {user && (
                <SafeAreaView style={[styles.container, { backgroundColor: Colors.screenBG }]}>
                    <View style={styles.header}>
                        <View style={styles.arrowContainer}>
                            <TouchableOpacity onPress={() => onClose(selections)}>
                                <ArrowBack
                                    width={_uiConfig.sizes.icon}
                                    height={_uiConfig.sizes.icon}
                                    fill={Colors.textColor}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text letterHeading color={Colors.textColor} adjustsFontSizeToFit>
                            {user.givenName + " " + user.familyName}
                        </Text>
                        <View style={styles.arrowContainer} />
                    </View>

                    <View style={styles.body}>
                        <FlatList
                            style={styles.list}
                            data={expense.items.filter((i) => !i.isProportional)}
                            ItemSeparatorComponent={ListSeparator}
                            renderItem={({ item }) => (
                                <ExpenseItem
                                    showOwners
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
            )}
        </Modal>
    );
});

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        rowGap: 10,
        alignItems: "center",
        height: "100%",
        paddingHorizontal: 10,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        paddingVertical: 20,
        paddingHorizontal: 15,
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
