import React, { useState } from "react";
import { Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from "react-native";
import { Button, Text, View } from "react-native-ui-lib/core";
import { SpTextInput } from "./SpTextInput";
import { CreateUserRequest } from "@splitsies/shared-models";

type Props = {
    userDetails: CreateUserRequest;
    onComplete: (email: string, password: string) => Promise<void>;
};

export const LoginDetailsForm = ({ userDetails, onComplete }: Props) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmedPassword, setConfirmedPassword] = useState<string>("");

    const [emailValid, setEmailValid] = useState<boolean>(false);
    const [passwordValid, setPasswordValid] = useState<boolean>(false);
    const [confirmedPasswordValid, setConfirmedPasswordValid] = useState<boolean>(false);

    const shouldValidateOnStart = (): boolean => {
        return !!email || !!password || !!confirmedPassword;
    };

    const isFormValid = (): boolean => {
        return emailValid && passwordValid && confirmedPasswordValid;
    };

    const isPasswordValid = (password: string): boolean => {
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        return password.length >= 8 && re.test(password);
    };

    const passwordsMatch = (confirmedPassword: string): boolean => {
        return password === confirmedPassword;
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ display: "flex", flexGrow: 1 }}>
                <KeyboardAvoidingView style={{ display: "flex", flex: 2, rowGap: 20, justifyContent: "center" }}>
                    <Text heading>Create an Account</Text>

                    <SpTextInput
                        label="Email"
                        floatingPlaceholder
                        value={email}
                        validate={["required", "email"]}
                        validationMessage={["Email is required", "Please enter a valid email address"]}
                        enableErrors
                        validateOnBlur
                        validateOnStart={shouldValidateOnStart()}
                        validationMessagePosition="bottom"
                        onChangeValidity={setEmailValid}
                        placeholder="Email"
                        onChangeText={setEmail}
                    />
                    <SpTextInput
                        label="Password"
                        secureTextEntry
                        floatingPlaceholder
                        value={password}
                        validate={["required", isPasswordValid]}
                        validationMessage={[
                            "Password is required",
                            "Password must contain 8+ characters, one capital letter, and one number",
                        ]}
                        enableErrors
                        validateOnBlur
                        validateOnStart={shouldValidateOnStart()}
                        validationMessagePosition="bottom"
                        onChangeValidity={setPasswordValid}
                        placeholder="Password"
                        onChangeText={setPassword}
                    />
                    <SpTextInput
                        secureTextEntry
                        label="Confirm Password"
                        floatingPlaceholder
                        value={confirmedPassword}
                        validate={["required", passwordsMatch]}
                        validationMessage={["Please confirm your password", "Passwords do not match"]}
                        enableErrors
                        validateOnBlur
                        validateOnStart={shouldValidateOnStart()}
                        validationMessagePosition="bottom"
                        onChangeValidity={setConfirmedPasswordValid}
                        placeholder="Confirm Password"
                        onChangeText={setConfirmedPassword}
                    />
                </KeyboardAvoidingView>

                <View style={{ display: "flex", flex: 1, justifyContent: "center", paddingBottom: 15 }}>
                    <Button
                        label="Create"
                        body
                        bg-primary
                        disabled={!isFormValid()}
                        onPress={() => void onComplete(email, password)}
                    />
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};
