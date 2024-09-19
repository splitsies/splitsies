import React from "react";
import { Colors, Modal } from "react-native-ui-lib";
import { ExpensePreview } from "./ExpensePreview";
import { ListSeparator } from "./ListSeparator";
import { lazyInject } from "../utils/lazy-inject";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import { IExpense } from "../models/expense/expense-interface";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _userManager = lazyInject<IUserManager>(IUserManager);

type Props = {
    parentSelectionVisible: boolean;
    onGroupAddDismiss: () => void;
    fetchPage: () => void;
    onExpenseAddToGroup: (expenseId: string) => void;
    selectedExpenseForGroupAdd: string | null;
    expenses: IExpense[];
};

export const ParentExpenseModal = SpThemedComponent(
    ({
        parentSelectionVisible,
        onGroupAddDismiss,
        fetchPage,
        onExpenseAddToGroup,
        selectedExpenseForGroupAdd,
        expenses,
    }: Props) => {
        return (
            <Modal
                animationType="slide"
                presentationStyle="pageSheet"
                visible={parentSelectionVisible}
                onDismiss={onGroupAddDismiss}
            >
                <SafeAreaView style={[styles.container, { backgroundColor: Colors.screenBG }]}>
                    <Modal.TopBar
                        title={"Select a group"}
                        titleStyle={_styleManager.typography.bodyBold}
                        onCancel={() => onGroupAddDismiss()}
                    />

                    <FlatList
                        contentContainerStyle={{ paddingBottom: 40 }}
                        onEndReached={(_) => void fetchPage()}
                        ItemSeparatorComponent={ListSeparator}
                        renderItem={({ item }) => (
                            <ExpensePreview
                                key={item.id}
                                data={item}
                                onPress={onExpenseAddToGroup}
                                person={_userManager.expenseUserDetails}
                                onLongPress={() => console.log("LONG")}
                                hideGroupAdd
                            />
                        )}
                        data={expenses.filter((e) => e.items.length === 0 && e.id !== selectedExpenseForGroupAdd)}
                    />
                </SafeAreaView>
            </Modal>
        );
    },
);

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
    },
});
