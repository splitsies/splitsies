import React from "react";
import { IExpenseItem } from "@splitsies/shared-models";
import { StyleSheet } from "react-native";
import { Checkbox, Colors } from "react-native-ui-lib";
import { Text, TouchableOpacity, View } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { useThemeWatcher } from "../hooks/use-theme-watcher";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import Edit from "../../assets/icons/edit.svg";

type Props = {
    item: IExpenseItem;
    selected?: boolean;
    editable?: boolean;
    selectable?: boolean;
    showOwners?: boolean;
    style?: object;
    onPress?: () => void;
    onSelect?: (id: string) => void;
};

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

export const ExpenseItem = ({ item, selected, selectable, editable, showOwners, style, onPress, onSelect }: Props) => {
    useThemeWatcher();
    const ownerList = item.owners
        .map((userDetails) => `${userDetails.isRegistered ? "@" + userDetails.username : userDetails.givenName}`)
        .filter((entry) => !!entry)
        .join(", ");

    return (
        <TouchableOpacity
            style={styles.body}
            disabled={!onPress}
            onPress={() => (editable ? onPress!() : onSelect?.(item.id))}
        >
            <View style={{ ...styles.container, ...style }}>
                <View style={styles.nameContainer}>
                    <View style={styles.itemContainer}>
                        <View style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}>
                            {editable && (
                                <Edit
                                    width={_uiConfig.sizes.smallIcon}
                                    height={_uiConfig.sizes.smallIcon}
                                    fill={Colors.textColor}
                                />
                            )}
                            {selectable && (
                                <Checkbox
                                    size={18}
                                    containerStyle={styles.checkbox}
                                    color={_colorConfiguration.primary}
                                    value={!!selected}
                                    onValueChange={() => onSelect?.(item.id)}
                                />
                            )}
                            <Text body numberOfLines={1} ellipsizeMode={"tail"} color={Colors.textColor}>
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
