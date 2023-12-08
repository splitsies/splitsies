import React, { useState } from "react";
import { Dimensions, KeyboardAvoidingView, StyleSheet } from "react-native";
import { Button, TextField, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _dimensions = Dimensions.get("screen");
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    onSave: (givenName: string) => void;
    onCancel: () => void;
};

export const AddGuestForm = ({ onSave, onCancel }: Props) => {
    const [name, setName] = useState<string>("");

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView style={styles.inputContainer}>
                <TextField
                    body
                    placeholder="Name"
                    value={name}
                    autoFocus
                    onChangeText={(text) => setName(text)}
                    style={styles.textInput}
                />

                <View row style={styles.buttons}>
                    <Button body label="Save" bg-primary onPress={() => onSave(name)} />
                    <Button body label="Cancel" bg-primary onPress={onCancel} />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        rowGap: 10,
        justifyContent: "center",
        alignItems: "center",
        height: "75%",
    },
    inputContainer: {
        display: "flex",
        justifyContent: "center",
        rowGap: 10,
        height: "75%",
        flexGrow: 1,
        alignItems: "center",
    },
    textInput: {
        height: 50,
        backgroundColor: "white",
        borderRadius: 25,
        width: _dimensions.width * 0.75,
        paddingHorizontal: 15,
        borderColor: _colorConfiguration.divider,
        borderWidth: 1,
    },
    buttons: {
        display: "flex",
        columnGap: 10,
    },
});
