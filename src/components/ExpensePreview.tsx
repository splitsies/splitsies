import React, { useState } from "react";
import { StyleSheet, Dimensions, NativeModules, Platform, TouchableOpacity } from "react-native";
import { IExpense } from "@splitsies/shared-models";
import { Icon, Text, View } from "react-native-ui-lib";
import { UserIcon } from "./UserIcon";
// import { Icon } from "./Icon";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Locale = (
    Platform.OS === "ios"
        ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier
).replace(/_/, "-");

// this type is the same as DATE_OPTIONS to satisfy the typescript compiler
type DateTimeFormatOptions = { weekday: "long"; year: "numeric"; month: "long"; day: "numeric" };
const DATE_OPTIONS: DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

interface propTypes {
    data: IExpense;
    onPress: (expenseId: string) => void;
    onLongPress?: () => void;
}

/**
 * @{@link propTypes}
 */
export const ExpensePreview = ({ data, onPress, onLongPress }: propTypes) => {
    const [peopleContainerWidth, setPeopleContainerWidth] = useState<number>(Dimensions.get("window").width);
    const PERSON_LIMIT = Math.floor((peopleContainerWidth - 20) / 30) - 1;
    const total = data.items.length === 0 ? 0 : data.items.reduce((p, c) => p + c.price, 0);

    return (
        <TouchableOpacity onPress={() => onPress(data.id)} onLongPress={onLongPress}>
            <View style={[styles.container]}>
                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Icon assetName="location" size={17} />
                    </View>
                    <View style={styles.rightBox}>
                        <Text>{data.name}</Text>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Icon assetName="calendar" size={17} />
                    </View>
                    <View style={styles.rightBox}>
                        <Text subtext>
                            {data.transactionDate.toLocaleString(Locale, DATE_OPTIONS).replace(/\d{2}:\d{2}:\d{2}/, "")}
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
                            <UserIcon letter="K" style={{ marginRight: 6 }} />
                            {/* {data.items.length === 0 ? (
                                <Text style={{ ...Font.HINT, color: themeColors.hint }}>None</Text>
                            ) : null}
                            {data.people.length > PERSON_LIMIT
                                ? data.people
                                .slice(0, PERSON_LIMIT)
                                .map(({ id, name }) => <UserIcon key={id} letter={name[0]} style={{ marginRight: 6 }} />)
                                : data.people.map(({ id, name }) => <UserIcon key={id} letter={name[0]} style={{ marginRight: 6 }} />)}
                            {data.people.length > PERSON_LIMIT ? (
                                <Text style={{ ...Font.BODY, color: themeColors.foregroundColor }}>
                                {' '}
                                + {data.people.length - PERSON_LIMIT}
                                </Text>
                            ) : null} */}
                        </View>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        <Icon assetName="price" size={17} />
                    </View>
                    <View style={styles.rightBox}>
                        <Text subtext>${total.toFixed(2)}</Text>
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
