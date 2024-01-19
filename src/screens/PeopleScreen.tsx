import React, { useCallback, useState } from "react";
import { People } from "../components/People";
import { useObservable } from "../hooks/use-observable";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IExpense } from "@splitsies/shared-models";
import { Observable, filter } from "rxjs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ExpenseParamList } from "../types/params";
import { TouchableOpacity, View } from "react-native-ui-lib/core";
import { SafeAreaView, StyleSheet } from "react-native";
import { Colors, Icon, Text } from "react-native-ui-lib";
import { PeopleFooter } from "../components/PeopleFooter";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { Container } from "../components/Container";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { ListSeparator } from "../components/ListSeparator";
import ArrowBack from "../../assets/icons/arrow-back.svg";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    MaterialTopTabScreenProps<ExpenseParamList, "People">
>;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

export const PeopleScreen = SpThemedComponent(({ navigation }: Props): JSX.Element => {
    const expenseUsers = useObservable(_expenseManager.currentExpenseUsers$, _expenseManager.currentExpenseUsers);
    const expense = useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => !!e)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
    );
    const [isSelecting, setIsSelecting] = useState<boolean>(false);

    const onBackPress = useCallback(() => {
        navigation.navigate("Items");
    }, [_expenseManager, navigation]);

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

    return !expense ? (
        <View />
    ) : (
        <Container>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBackPress}>
                        <ArrowBack width={_uiConfig.sizes.icon} height={_uiConfig.sizes.icon} fill={Colors.textColor} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsSelecting(true)}>
                        <Text bodyBold color={Colors.textColor}>
                            Select
                        </Text>
                    </TouchableOpacity>
                </View>

                <People
                    people={expenseUsers}
                    expense={expense}
                    updateItemOwners={updateExpenseItemOwners}
                    isSelecting={isSelecting}
                    endSelectingMode={() => setIsSelecting(false)}
                />

                <View style={styles.footer}>
                    <ListSeparator />
                    <PeopleFooter expense={expense} expenseUsers={expenseUsers} />
                </View>
            </SafeAreaView>
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
    footer: {
        display: "flex",
        rowGap: 10,
        paddingVertical: 10,
    },
});
