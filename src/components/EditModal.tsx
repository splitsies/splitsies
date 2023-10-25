import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, KeyboardAvoidingView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Checkbox, Modal, NumberInputData, TextField, View } from "react-native-ui-lib";
import { EditResult } from "../models/edit-result";

import NumberInput from "react-native-ui-lib/numberInput";
import _default from "@react-native-community/netinfo";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _dimensions = Dimensions.get("screen");
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    visible: boolean;
    nameValue?: string;
    priceValue?: number;
    onSave: (result: EditResult) => void;
    onCancel: () => void;
    onDelete?: () => void;
    children?: any;
    proportional?: boolean;
};

export const EditModal = ({ visible, nameValue, priceValue, onSave, onCancel, proportional, onDelete }: Props) => {
    const [name, setName] = useState<string>(nameValue ?? "");
    const [price, setPrice] = useState<number>(priceValue ?? 0);
    const [isProportional, setIsProportional] = useState<boolean>(!!proportional);

    const textFieldProps = {
        style: styles.textInput,
        body: true,
        caretHidden: false,
    };

    useEffect(() => setName(nameValue ?? ""), [nameValue, visible]);
    useEffect(() => setPrice(priceValue ?? 0), [priceValue, visible]);
    useEffect(() => setIsProportional(proportional ?? false), [proportional, visible]);

    const onChangeNumber = useCallback(
        (data: NumberInputData): void => {
            if (data.type === "valid") {
                setPrice(data.number);
            }
        },
        [setPrice],
    );

    return (
        <Modal enableModalBlur visible={visible} transparent animationType="fade">
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView style={styles.inputContainer}>
                    {nameValue != null && (
                        <TextField
                            body
                            placeholder="Name"
                            value={name}
                            onChangeText={(text) => setName(text)}
                            style={styles.textInput}
                        />
                    )}

                    {priceValue != null && (
                        <NumberInput
                            initialNumber={price}
                            onChangeNumber={onChangeNumber}
                            textFieldProps={textFieldProps}
                        />
                    )}

                    <View row style={styles.buttons}>
                        <Button body label="Save" bg-primary onPress={() => onSave({ name, price, isProportional })} />
                        <Button body label="Cancel" bg-primary onPress={onCancel} />
                        {onDelete != null && <Button body label="Delete" bg-primary onPress={onDelete} />}
                    </View>
                </KeyboardAvoidingView>
                <View style={styles.optionsContainer}>
                    {proportional != null && (
                        <View style={styles.input}>
                            <Checkbox
                                containerStyle={styles.textInput}
                                color={_colorConfiguration.primary}
                                value={isProportional}
                                label="Proportional"
                                onValueChange={() => setIsProportional(!isProportional)}
                            />
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        rowGap: 10,
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    inputContainer: {
        display: "flex",
        justifyContent: "flex-end",
        rowGap: 10,
        flexGrow: 1,
        alignItems: "center",
    },
    optionsContainer: {
        display: "flex",
        flex: 6,
        flexGrow: 1,
        alignItems: "center",
        paddingBottom: 25,
    },
    input: {
        display: "flex",
        flex: 4,
        marginTop: 50,
    },
    textInput: {
        height: 50,
        backgroundColor: "white",
        borderRadius: 25,
        width: _dimensions.width * 0.75,
        paddingHorizontal: 15,
    },
    buttons: {
        display: "flex",
        columnGap: 10,
    },
});
