import React, { useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Icon, TextField } from "react-native-ui-lib";
import { Text, View, Button } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { SplitsiesTitle } from "./SplitsiesTitle";

const _dimensions = Dimensions.get("screen");
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    onLoginClicked: (email: string, password: string) => void;
    onSignUpClicked: () => void;
    validationError: string;
};

export const LoginForm = ({ onLoginClicked, onSignUpClicked, validationError }: Props) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    return (
        <View style={styles.container}>
            <SplitsiesTitle center style={{ marginBottom: 20 }} />

            <View flex-2 style={styles.formContainer}>
                <TextField
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    fieldStyle={styles.textInput}
                    placeholder={"Email"}
                    validate={["required", "email"]}
                    validationMessage={["Required", "Email is invalid"]}
                    retainValidationSpace
                    body
                />

                <TextField
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.textInput}
                    placeholder={"Password"}
                    validate={["required", () => !!validationError]}
                    validationMessage={["Required", validationError]}
                    body
                />

                {!!validationError && (
                    <Text subtext danger style={{ width: _dimensions.width * 0.7 }}>
                        {validationError}
                    </Text>
                )}

                <Button
                    label="Don't have an account? Sign up"
                    link
                    body
                    bg-primary
                    size="small"
                    marginT-15
                    onPress={() => onSignUpClicked()}
                />
            </View>

            <View flex-2 centerH>
                <Button
                    style={styles.input}
                    body
                    marginT-15
                    label="Log in"
                    onPress={() => onLoginClicked(email, password)}
                    bg-primary
                    size="large"
                    enableShadow
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
        justifyContent: "center",
        width: "100%",
    },
    formContainer: {
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
        width: "100%",
        rowGap: 10,
    },
    textInput: {
        display: "flex",
        width: _dimensions.width * 0.75,
        backgroundColor: _colorConfiguration.primaryTranslucent,
        borderRadius: 18,
        height: 38,
        paddingHorizontal: 15,
        textAlignVertical: "center",
    },
    input: {
        display: "flex",
        width: _dimensions.width * 0.75,
    },
});
