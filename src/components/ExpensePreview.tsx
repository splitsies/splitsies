import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, NativeModules, Platform, TouchableOpacity } from "react-native";
import { IExpense, IExpenseMapper, IExpensePayload } from "@splitsies/shared-models";
import { Icon, Text, View } from "react-native-ui-lib";
import { UserIcon } from "./UserIcon";
import { lazyInject } from "../utils/lazy-inject";

const Locale = (
    Platform.OS === "ios"
        ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier
).replace(/_/, "-");

// this type is the same as DATE_OPTIONS to satisfy the typescript compiler
type DateTimeFormatOptions = { weekday: "long"; year: "numeric"; month: "long"; day: "numeric" };
const DATE_OPTIONS: DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

const _expenseMapper = lazyInject<IExpenseMapper>(IExpenseMapper);

interface propTypes {
    data: IExpensePayload;
    onPress: (expenseId: string) => void;
    onLongPress?: () => void;
}

/**
 * @{@link propTypes}
 */
export const ExpensePreview = ({ data, onPress, onLongPress }: propTypes) => {
    const [expense, setExpense] = useState<IExpense>(_expenseMapper.toDomainModel(data.expense));
    const [peopleContainerWidth, setPeopleContainerWidth] = useState<number>(Dimensions.get("window").width);
    const PERSON_LIMIT = Math.floor((peopleContainerWidth - 20) / 36) - 1;

    useEffect(() => setExpense(_expenseMapper.toDomainModel(data.expense)), [data]);

    return (
        <TouchableOpacity onPress={() => onPress(expense.id)} onLongPress={onLongPress}>
            <View style={[styles.container]}>
                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Icon assetName="location" size={17} />
                    </View>
                    <View style={styles.rightBox}>
                        <Text>{expense.name}</Text>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Icon assetName="calendar" size={17} />
                    </View>
                    <View style={styles.rightBox}>
                        <Text subtext>
                            {expense.transactionDate
                                .toLocaleString(Locale, DATE_OPTIONS)
                                .replace(/\d{2}:\d{2}:\d{2}/, "")}
                        </Text>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Icon assetName="people" size={17} />
                    </View>
                    <View style={styles.rightBox}>
                        <View
                            style={styles.peopleContainer}
                            onLayout={({ nativeEvent }) => setPeopleContainerWidth(nativeEvent.layout.width)}
                        >
                            {data.expenseUsers.length === 0 && <Text hint>None</Text>}
                            {data.expenseUsers.length > PERSON_LIMIT
                                ? data.expenseUsers
                                      .slice(0, PERSON_LIMIT)
                                      .map(({ id, givenName }) => (
                                          <UserIcon key={id} letter={givenName[0]} style={{ marginRight: 6 }} />
                                      ))
                                : data.expenseUsers.map(({ id, givenName }) => (
                                      <UserIcon key={id} letter={givenName[0]} style={{ marginRight: 6 }} />
                                  ))}

                            {data.expenseUsers.length > PERSON_LIMIT && (
                                <Text body>+ {data.expenseUsers.length - PERSON_LIMIT}</Text>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Icon assetName="price" size={17} />
                    </View>
                    <View style={styles.rightBox}>
                        <Text subtext>${expense.total.toFixed(2)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    rowContainer: {
        marginVertical: 1,
        width: "100%",
        flexDirection: "row",
    },
    leftBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        marginRight: 15,
    },
    rightBox: {
        flex: 5,
        justifyContent: "center",
    },
    peopleContainer: {
        flexDirection: "row",
        marginVertical: 5,
        alignItems: "center",
    },
});
