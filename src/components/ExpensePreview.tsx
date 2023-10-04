import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { IExpense } from '@splitsies/shared-models';


// this type is the same as DATE_OPTIONS to satisfy the typescript compiler
type DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const DATE_OPTIONS: DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


interface propTypes {
    data: IExpense;
    onPress: (expenseId: string) => void;
    onLongPress?: () => void;
};

/**
 * @{@link propTypes}
 */
export const ExpensePreview = ({ data, onPress, onLongPress }: propTypes) => {
    const [peopleContainerWidth, setPeopleContainerWidth] = useState<number>(Dimensions.get("window").width);

    const PERSON_LIMIT = Math.floor((peopleContainerWidth - 20) / 30) - 1;
    const total = data.items.length === 0 ? 0 : 50;

    return (
        <TouchableOpacity activeOpacity={0.5} onPress={() => onPress(data.id)} onLongPress={onLongPress}>
            <View style={[styles.container]}>
                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        {/* <Icon iconPack="MaterialIcons" name="location-on" size={Size.SMALL_ICON}  /> */}
                    </View>
                    <View style={styles.rightBox}>
                        <Text
                            numberOfLines={1}>
                            {data.name}
                        </Text>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        {/* <Icon iconPack="MaterialIcons" name="date-range" size={Size.SMALL_ICON} /> */}
                    </View>
                    <View style={styles.rightBox}>
                        <Text>
                            {data.transactionDate.toLocaleString(undefined, DATE_OPTIONS).replace(/\d{2}:\d{2}:\d{2}/, '')}
                        </Text>
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        {/* <Icon iconPack="MaterialIcons" name="people" size={Size.SMALL_ICON}  /> */}
                    </View>
                    <View style={styles.rightBox}>
                        {/* <View
                            style={styles.peopleContainer}
                            onLayout={({ nativeEvent }) => setPeopleContainerWidth(nativeEvent.layout.width)}>
                            {data.items.length === 0 ? (
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
                            ) : null}
                        </View> */}
                    </View>
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.leftBox}>
                        {/* <Icon iconPack="MaterialIcons" name="attach-money" size={Size.SMALL_ICON}> */}
                    </View>
                    <View style={styles.rightBox}>
                        <Text>
                            ${total.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    rowContainer: {
        marginVertical: 1,
        width: '100%',
        flexDirection: 'row',
    },
    leftBox: {
        flex: 1,
        justifyContent: 'center',
    },
    rightBox: {
        flex: 5,
        justifyContent: 'center',
    },
    peopleContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        alignItems: 'center',
    },
});

