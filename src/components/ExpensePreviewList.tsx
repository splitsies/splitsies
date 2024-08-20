import React, { useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import { ListSeparator } from "./ListSeparator";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { ExpensePreview } from "./ExpensePreview";
import { TutorialTip } from "./TutorialTip";
import { IExpense } from "../models/expense/expense-interface";
import { IUserManager } from "../managers/user-manager/user-manager-interface";

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _userManager = lazyInject<IUserManager>(IUserManager);

type Props = {
    refreshDisabled?: boolean;
    hidePeople?: boolean;
    expenses: IExpense[];
    setFetchingPage?: (value: boolean) => void;
    onExpenseClick: (id: string) => void;
    onRefresh?: () => void;
};

export const ExpensePreviewList = ({
    expenses,
    setFetchingPage,
    onExpenseClick,
    hidePeople,
    refreshDisabled,
    onRefresh
}: Props): React.ReactNode => {
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const refresh = async (): Promise<void> => {
        if (onRefresh) {
            onRefresh();
            return;
        }
        
        setRefreshing(true);
        await _expenseManager.requestForUser();
        setRefreshing(false);
    };

    const fetchPage = async (): Promise<void> => {
        setFetchingPage?.(true);
        await _expenseManager.requestForUser(false);
        setFetchingPage?.(false);
    };

    return (
        <FlatList
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={refreshDisabled ? undefined : <RefreshControl refreshing={refreshing} onRefresh={refresh} />}
            onEndReached={(_) => void fetchPage()}
            ItemSeparatorComponent={ListSeparator}
            renderItem={({ item, index }) =>
                index !== 0 ? (
                    <ExpensePreview
                        key={item.id}
                        hidePeople={hidePeople}
                        data={item}
                        onPress={onExpenseClick}
                        person={_userManager.expenseUserDetails}
                        onLongPress={() => console.log("LONG")}
                    />
                ) : (
                    <TutorialTip group="home" stepKey="expenseItem" placement="bottom" renderOnLayout>
                        <ExpensePreview
                            key={item.id}
                            hidePeople={hidePeople}
                            data={item}
                            onPress={onExpenseClick}
                            person={_userManager.expenseUserDetails}
                            onLongPress={() => console.log("LONG")}
                        />
                    </TutorialTip>
                )
            }
            data={expenses}
        />
    );
};
