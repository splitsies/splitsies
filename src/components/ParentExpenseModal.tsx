import React from "react";
import { Modal } from "react-native-ui-lib";
import { ExpensePreview } from "./ExpensePreview";
import { ListSeparator } from "./ListSeparator";
import { lazyInject } from "../utils/lazy-inject";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { FlatList } from "react-native";
import { IExpense } from "../models/expense/expense-interface";

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

export const ParentExpenseModal = ({
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
        </Modal>
    );
};
