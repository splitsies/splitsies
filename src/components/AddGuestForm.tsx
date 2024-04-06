import React, { useState } from "react";
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, StyleSheet } from "react-native";
import { Button, Colors, TextField, View } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Container } from "./Container";

const _dimensions = Dimensions.get("screen");
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    onSave: (givenName: string) => void;
    onCancel: () => void;
};

export const AddGuestForm = ({ onSave, onCancel }: Props) => {
    const [name, setName] = useState<string>("");
    const [pending, setPending] = useState<boolean>(false);

    return (
        <Container>
            <KeyboardAvoidingView style={styles.inputContainer}>
                <View style={styles.textContainer}>
                    <TextField
                        body
                        bg-screenBG
                        placeholderTextColor={_colorConfiguration.greyFont}
                        placeholder="Name"
                        value={name}
                        autoFocus
                        style={styles.textInput}
                        onChangeText={(text) => setName(text)}
                    />
                    {pending && <ActivityIndicator color={Colors.textColor} />}
                </View>

                <View row style={styles.buttons}>
                    <Button
                        body
                        labelStyle={{color: "black"}} 
                        label="Save"
                        bg-primary
                        onPress={() => {
                            setPending(true);
                            onSave(name);
                        }}
                    />
                    <Button body labelStyle={{color: "black"}} label="Cancel" bg-primary onPress={onCancel} />
                </View>
            </KeyboardAvoidingView>
        </Container>
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
    textContainer: {
        height: 50,
        borderRadius: 25,
        width: _dimensions.width * 0.75,
        paddingHorizontal: 15,
        borderColor: _colorConfiguration.divider,
        borderWidth: 1,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    textInput: {
        height: 50,
    },
    buttons: {
        display: "flex",
        columnGap: 10,
    },
});
