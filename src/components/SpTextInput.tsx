import React from "react";
import { Dimensions, StyleSheet, PixelRatio } from "react-native";
import { TextField, TextFieldProps } from "react-native-ui-lib";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _dimensions = Dimensions.get("screen");
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

export const SpTextInput = (props: TextFieldProps): JSX.Element => {
    return (
        <TextField
            body
            autoCapitalize={props.autoCapitalize}
            secureTextEntry={props.secureTextEntry}
            inputMode={props.inputMode}
            floatingPlaceholder
            floatingPlaceholderStyle={styles.label}
            floatOnFocus
            validate={props.validate}
            validationMessageStyle={styles.validationMessage}
            enableErrors={props.enableErrors}
            validationMessage={props.validationMessage}
            validateOnChange={props.validateOnChange}
            validateOnBlur={props.validateOnBlur}
            validateOnStart={props.validateOnStart}
            onChangeValidity={props.onChangeValidity}
            validationMessagePosition={props.validationMessagePosition}
            retainValidationSpace={false}
            placeholder={props.placeholder}
            value={props.value}
            autoFocus={props.autoFocus}
            onChangeText={props.onChangeText}
            style={[styles.textInput, props.style]}
        />
    );
};

const styles = StyleSheet.create({
    label: {
        lineHeight: 50 * (1 / PixelRatio.getFontScale()),
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    textInput: {
        height: 50,
        borderRadius: 25,
        width: _dimensions.width * 0.75,
        paddingHorizontal: 15,
        backgroundColor: _colorConfiguration.primaryTranslucent,
        zIndex: -1
    },
    validationMessage: {
        paddingHorizontal: 20,
        paddingTop: 2,
        maxWidth: _dimensions.width * 0.75,
    },
});
