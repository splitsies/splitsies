import React, { useState } from "react";
import { Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from "react-native";
import { Button, Colors, Text, View } from "react-native-ui-lib/core";
import { SpTextInput } from "./SpTextInput";
import { CreateUserRequest } from "@splitsies/shared-models";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

type Props = {
    userDetails: CreateUserRequest;
    onComplete: (email: string, username: string, password: string) => Promise<void>;
};

export const LoginDetailsForm = SpThemedComponent(({ userDetails, onComplete }: Props) => {
    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmedPassword, setConfirmedPassword] = useState<string>("");

    const [emailValid, setEmailValid] = useState<boolean>(false);
    const [usernameValid, setUsernameValid] = useState<boolean>(false);
    const [passwordValid, setPasswordValid] = useState<boolean>(false);
    const [confirmedPasswordValid, setConfirmedPasswordValid] = useState<boolean>(false);

    const shouldValidateOnStart = (): boolean => {
        return !!email || !!password || !!confirmedPassword;
    };

    const isFormValid = (): boolean => {
        return emailValid && passwordValid && confirmedPasswordValid && usernameValid;
    };

    const isPasswordValid = (password: string): boolean => {
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        return password.length >= 8 && re.test(password);
    };

    const isUsernameValid = (username: string): boolean => {
        const re = /^[a-zA-Z0-9\-]*$/;
        return re.test(username);
    };

    const passwordsMatch = (confirmedPassword: string): boolean => {
        return password === confirmedPassword;
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ display: "flex", flexGrow: 1 }}>
                <View style={{ display: "flex", flex: 2, rowGap: 10, justifyContent: "center" }}>
                    <Text heading color={Colors.textColor}>
                        Login Details
                    </Text>

                    <KeyboardAvoidingView>
                        <SpTextInput
                            autoCapitalize="none"
                            label="Email"
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
                    </KeyboardAvoidingView>

                    <KeyboardAvoidingView>
                        <SpTextInput
                            autoCapitalize="none"
                            label="Username"
                            value={username}
                            validate={["required", isUsernameValid]}
                            validationMessage={[
                                "Username is required",
                                "Username must contain only alphanumeric characters and hyphens",
                            ]}
                            enableErrors
                            validateOnBlur
                            validateOnStart={shouldValidateOnStart()}
                            validationMessagePosition="bottom"
                            onChangeValidity={setUsernameValid}
                            placeholder="Username"
                            onChangeText={setUsername}
                        />
                    </KeyboardAvoidingView>

                    <KeyboardAvoidingView>
                        <SpTextInput
                            autoCapitalize="none"
                            label="Password"
                            secureTextEntry
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
                    </KeyboardAvoidingView>

                    <KeyboardAvoidingView>
                        <SpTextInput
                            autoCapitalize="none"
                            secureTextEntry
                            label="Confirm Password"
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
                </View>

                <View style={{ display: "flex", flex: 1, justifyContent: "center", paddingBottom: 15 }}>
                    <Button
                        body
                        bg-primary
                        label="Continue"
                        disabled={!isFormValid()}
                        onPress={() => onComplete(email, username, password)}
                    />
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
});
