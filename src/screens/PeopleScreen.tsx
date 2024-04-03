import React, { useCallback, useState } from "react";
import { People } from "../components/People";
import { useObservable } from "../hooks/use-observable";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { lazyInject } from "../utils/lazy-inject";
import { Observable, filter } from "rxjs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ExpenseParamList } from "../types/params";
import { TouchableOpacity, View } from "react-native-ui-lib/core";
import { ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";
import { Colors, Icon, Text } from "react-native-ui-lib";
import { PeopleFooter } from "../components/PeopleFooter";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { Container } from "../components/Container";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { ListSeparator } from "../components/ListSeparator";
import ArrowBack from "../../assets/icons/arrow-back.svg";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { IExpense } from "../models/expense/expense-interface";

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    MaterialTopTabScreenProps<ExpenseParamList, "People">
>;

const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

export const PeopleScreen = SpThemedComponent(({ navigation }: Props): JSX.Element => {
    const expense = useObservable<IExpense>(
        _expenseManager.currentExpense$.pipe(filter((e) => !!e)) as Observable<IExpense>,
        _expenseManager.currentExpense!,
        () => setAwaitingResponse(false),
    );

    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const onBackPress = useCallback(() => {
        navigation.navigate("Items");
    }, [_expenseManager, navigation]);

    const updateExpenseItemOwners = (userId: string, selectedItemIds: string[]): void => {
        const user = expense.users.find((u) => u.id === userId);
        if (!user) return;
        _expenseManager.updateItemSelections(expense.id, user, selectedItemIds);
        setAwaitingResponse(true);
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
                        <View flex row centerV style={{ columnGap: 10 }}>
                            <ActivityIndicator animating={awaitingResponse} hidesWhenStopped color={Colors.textColor} />
                            <Text bodyBold color={Colors.textColor}>
                                Select
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <People
                    people={expense.users}
                    expense={expense}
                    updateItemOwners={updateExpenseItemOwners}
                    isSelecting={isSelecting}
                    endSelectingMode={() => setIsSelecting(false)}
                />

                <View style={styles.footer}>
                    <ListSeparator />
                    <PeopleFooter expense={expense} expenseUsers={expense.users} />
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
