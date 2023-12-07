import React from "react";
import { IExpenseItem } from "@splitsies/shared-models";
import { StyleSheet } from "react-native";
import { Checkbox } from "react-native-ui-lib";
import { Text, TouchableOpacity, View } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

type Props = {
    item: IExpenseItem;
    selected?: boolean;
    selectable?: boolean;
    showOwners?: boolean;
    style?: object;
    onPress?: () => void;
    onSelect?: (id: string) => void;
};

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

export const ExpenseItem = ({ item, selected, selectable, showOwners, style, onPress, onSelect }: Props) => {
    const ownerList = item.owners
        .map(
            (userDetails) => `${userDetails.givenName}${userDetails.familyName ? " " + userDetails.familyName[0] : ""}`,
        )
        .filter((entry) => !!entry)
        .join(", ");

    return (
        <TouchableOpacity
            style={styles.body}
            disabled={!onPress}
            onPress={() => (selectable ? onSelect?.(item.id) : onPress!())}
        >
            <View style={{ ...styles.container, ...style }}>
                <View style={styles.nameContainer}>
                    <View style={styles.itemContainer}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {selectable && (
                                <Checkbox
                                    size={18}
                                    containerStyle={styles.checkbox}
                                    color={_colorConfiguration.primary}
                                    value={!!selected}
                                    onValueChange={() => onSelect?.(item.id)}
                                />
                            )}
                            <Text body numberOfLines={1} ellipsizeMode={"tail"}>
                                {item.name}
                            </Text>
                        </View>

                        {showOwners && ownerList.length > 0 && <Text hint>{ownerList}</Text>}
                    </View>
                </View>
                <Text hint>
                    {item.price < 0 ? "-" : null}${Math.abs(item.price).toFixed(2)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    body: {
        width: "100%",
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        marginVertical: 5,
        paddingHorizontal: 15,
    },
    nameContainer: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: "column",
        justifyContent: "center",
        paddingRight: 2,
    },
    checkbox: {
        marginRight: 10,
    },
});
