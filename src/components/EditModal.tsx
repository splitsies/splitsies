import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Modal, NumberInput, TextField, View } from "react-native-ui-lib";
import { EditResult } from "../models/edit-result";

const _dimensions = Dimensions.get("screen");

type Props = {
    visible: boolean;
    nameValue?: string;
    showNameField?: boolean;
    priceValue?: number;
    showPriceField?: boolean;
    onSave: (result: EditResult) => void;
    onCancel: () => void;
};

export const EditModal = ({
    visible,
    nameValue,
    showNameField,
    priceValue,
    showPriceField,
    onSave,
    onCancel,
}: Props) => {
    const [name, setName] = useState<string>(nameValue);
    const [price, setPrice] = useState<number>(priceValue ?? 0);

    useEffect(() => setName(nameValue ?? ""), [nameValue]);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <SafeAreaView
                style={{
                    display: "flex",
                    rowGap: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    backgroundColor: "rgba(50,50,50,0.5)",
                }}
            >
                {showNameField && (
                    <TextField
                        placeholder="Name"
                        value={name}
                        onChangeText={(text) => setName(text)}
                        style={{
                            height: 50,
                            backgroundColor: "white",
                            borderRadius: 25,
                            width: _dimensions.width * 0.75,
                            paddingHorizontal: 15,
                        }}
                    />
                )}

                {/* {showPriceField &&
                    <NumberInput
                    placeholder="Price"
                    value={price}
                        style={{ height: 50, backgroundColor: "white", borderRadius: 25, width: _dimensions.width * 0.75, paddingHorizontal: 15 }} />}
                 */}
                <View row style={styles.buttons}>
                    <Button body label="Save" bg-primary onPress={() => onSave({ name, price })} />

                    <Button body label="Cancel" bg-primary onPress={onCancel} />
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    buttons: {
        columnGap: 10,
    },
});
