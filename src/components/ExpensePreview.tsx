import React, { useState } from "react";
import { StyleSheet, Dimensions, NativeModules, Platform, TouchableOpacity } from "react-native";
import { Colors, Text, View } from "react-native-ui-lib";
import { UserIcon } from "./UserIcon";
import { lazyInject } from "../utils/lazy-inject";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { IExpense } from "../models/expense/expense-interface";
import Location from "../../assets/icons/location.svg";
import Calendar from "../../assets/icons/calendar.svg";
import People from "../../assets/icons/people.svg";
import Price from "../../assets/icons/price.svg";

const Locale = (
    Platform.OS === "ios"
        ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier
).replace(/_/, "-");

// this type is the same as DATE_OPTIONS to satisfy the typescript compiler
type DateTimeFormatOptions = { weekday: "long"; year: "numeric"; month: "long"; day: "numeric" };
const DATE_OPTIONS: DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

const iconSize = _uiConfig.sizes.smallIcon;

interface propTypes {
    data: IExpense;
    onPress?: (expenseId: string) => void;
    onLongPress?: () => void;
}

/**
 * @{@link propTypes}
 */
export const ExpensePreview = SpThemedComponent(({ data, onPress, onLongPress }: propTypes) => {
    const [peopleContainerWidth, setPeopleContainerWidth] = useState<number>(Dimensions.get("window").width);
    const PERSON_LIMIT = Math.floor((peopleContainerWidth - 20) / 34) - 1;

    return (
        <TouchableOpacity disabled={!!!onPress} onPress={() => onPress?.(data.id)} onLongPress={onLongPress}>
            <View style={[styles.container]}>
                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Location width={iconSize} height={iconSize} fill={Colors.textColor} />
                    </View>
                    <View style={styles.rightBox}>
                        <Text bodyBold color={Colors.textColor}>
                            {data.name}
                        </Text>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Calendar width={iconSize} height={iconSize} fill={Colors.textColor} />
                    </View>
                    <View style={styles.rightBox}>
                        <Text subtext color={Colors.textColor}>
                            {data.transactionDate.toLocaleString(Locale, DATE_OPTIONS).replace(/\d{2}:\d{2}:\d{2}/, "")}
                        </Text>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <People width={iconSize} height={iconSize} fill={Colors.textColor} />
                    </View>
                    <View style={styles.rightBox}>
                        <View
                            style={styles.peopleContainer}
                            onLayout={({ nativeEvent }) => setPeopleContainerWidth(nativeEvent.layout.width)}
                        >
                            {data.users.length === 0 && <Text hint>None</Text>}
                            {data.users.length > PERSON_LIMIT
                                ? data.users
                                      .slice(0, PERSON_LIMIT)
                                      .map(({ id, givenName }) => (
                                          <UserIcon key={id} letter={givenName[0]} style={{ marginRight: 6 }} />
                                      ))
                                : data.users.map(({ id, givenName }) => (
                                      <UserIcon key={id} letter={givenName[0]} style={{ marginRight: 6 }} />
                                  ))}

                            {data.users.length > PERSON_LIMIT && (
                                <Text body color={Colors.textColor}>
                                    + {data.users.length - PERSON_LIMIT}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Price width={iconSize} height={iconSize} fill={Colors.textColor} />
                    </View>
                    <View style={styles.rightBox}>
                        <Text subtext color={Colors.textColor}>
                            ${data.total.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        width: "100%",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
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
        flex: 8,
        justifyContent: "center",
    },
    peopleContainer: {
        flexDirection: "row",
        marginVertical: 5,
        alignItems: "center",
    },
});
