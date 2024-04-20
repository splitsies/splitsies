import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Checkbox, Colors, Modal, TextField, TextFieldRef, View } from "react-native-ui-lib";
import { EditResult } from "../models/edit-result";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { useThemeWatcher } from "../hooks/use-theme-watcher";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";

const _dimensions = Dimensions.get("screen");
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);

type Props = {
    visible: boolean;
    nameValue?: string;
    priceValue?: number;
    onSave: (result: EditResult) => void;
    onCancel: () => void;
    onDelete?: () => void;
    proportional?: boolean;
};

export const EditModal = ({ visible, nameValue, priceValue, onSave, onCancel, proportional, onDelete }: Props) => {
    useThemeWatcher();
    const [name, setName] = useState<string>(nameValue ?? "");
    const [isProportional, setIsProportional] = useState<boolean>(!!proportional);

    const [, updateState] = React.useState<any>();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const priceField = useRef<TextInput>(null);
    const price = useRef<number>(priceValue ?? 0);

    const setPrice = (newPrice: number): void => {
        price.current = newPrice;
        priceField.current?.setNativeProps({
            text: `${price.current.toFixed(2)}`,
        });
    };

    useEffect(() => setName(nameValue ?? ""), [nameValue, visible]);
    useEffect(() => setPrice(priceValue ?? 0), [price, priceValue, visible]);
    useEffect(() => setIsProportional(proportional ?? false), [proportional, visible]);

    const onPriceChange = (value: string): void => {
        const expanded = value.replace(".", "");
        const parsedPrice = parseFloat(expanded) / 100;
        setPrice(parsedPrice);
    };

    return (
        <Modal enableModalBlur visible={visible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <SafeAreaView style={styles.container}>
                    <KeyboardAvoidingView style={styles.inputContainer}>
                        {nameValue != null && (
                            <TextField
                                body
                                placeholder="Name"
                                placeholderTextColor={_colorConfiguration.greyFont}
                                value={name}
                                onChangeText={(text) => setName(text)}
                                style={[styles.textInput, { backgroundColor: Colors.screenBG }]}
                                color={Colors.textColor}
                            />
                        )}

                        {priceValue != null && (
                            <TextInput
                                ref={priceField}
                                caretHidden
                                placeholder="Price"
                                placeholderTextColor={_colorConfiguration.greyFont}
                                inputMode="numeric"
                                onChangeText={(text) => onPriceChange(text)}
                                style={[
                                    styles.textInput,
                                    _styleManager.typography.body,
                                    { backgroundColor: Colors.screenBG },
                                ]}
                                color={Colors.textColor}
                            />
                        )}

                        <View row style={styles.buttons}>
                            <Button
                                body
                                labelStyle={{ color: "black" }}
                                label="Save"
                                bg-primary
                                onPress={() => onSave({ name, price: price.current, isProportional })}
                            />
                            <Button body labelStyle={{ color: "black" }} label="Cancel" bg-primary onPress={onCancel} />
                            {onDelete != null && (
                                <Button
                                    body
                                    labelStyle={{ color: "black" }}
                                    label="Delete"
                                    bg-primary
                                    onPress={onDelete}
                                />
                            )}
                        </View>
                    </KeyboardAvoidingView>
                    <View style={styles.optionsContainer}>
                        {proportional != null && (
                            <Checkbox
                                containerStyle={[styles.textInput, { backgroundColor: Colors.screenBG }]}
                                color={_colorConfiguration.primary}
                                value={isProportional}
                                label="Proportional"
                                onValueChange={() => setIsProportional(!isProportional)}
                            />
                        )}

                        {priceValue != null && (
                            <Checkbox
                                containerStyle={[styles.textInput, { backgroundColor: Colors.screenBG }]}
                                color={_colorConfiguration.primary}
                                value={price.current < 0}
                                label="Discount"
                                onValueChange={() => {
                                    setPrice(-price.current);
                                    forceUpdate();
                                }}
                            />
                        )}
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
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
        backgroundColor: _colorConfiguration.darkOverlay,
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
        paddingTop: 25,
        rowGap: 10,
    },
    textInput: {
        height: 50,
        borderRadius: 25,
        width: _dimensions.width * 0.75,
        paddingHorizontal: 15,
    },
    buttons: {
        display: "flex",
        columnGap: 10,
    },
});
