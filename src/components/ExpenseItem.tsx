import { IExpenseItem } from "@splitsies/shared-models";
import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { Icon } from "react-native-ui-lib";
import { Text, TouchableOpacity, View } from "react-native-ui-lib/core";

type Props = {
    item: IExpenseItem;
    interactable?: boolean;
    showInteractable?: boolean;
    showOwners?: boolean;
    style?: object;
};

export const ExpenseItem = ({ item, interactable, showOwners, style, showInteractable }: Props) => {
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
    });

    const onPressHandler = (): void => {
        // dispatch(stateModifier.selectedItem(item));
        // dispatch(stateModifier.choiceVisible(true));
    };

    const ownerList = item.owners
        .map((personId) => personId)
        .filter((entry) => !!entry)
        .join(", ");

    return (
        <TouchableOpacity style={styles.body} onPress={onPressHandler} disabled={!interactable}>
            <View style={{ ...styles.container, ...style }}>
                <View style={styles.nameContainer}>
                    <View style={styles.itemContainer}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {/* {showInteractable && 
                                 <Icon assetName='pencil' style={{ marginHorizontal: 5 }} size={15} />} */}

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
