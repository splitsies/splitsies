import React, { useState } from "react";
import { Button, Text, View } from "react-native-ui-lib/core";
import { SpTextInput } from "./SpTextInput";
import { Dimensions, Keyboard, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { DateTimePicker } from "react-native-ui-lib";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";
import { CreateUserRequest, IUserDto } from "@splitsies/shared-models";

const _dimensions = Dimensions.get("screen");
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

type Props = {
    userDetails: CreateUserRequest;
    onContinue: (givenName: string, familyName: string, phoneNumber: string, dateOfBirth: Date) => void;
};

export const UserDetailsForm = ({ userDetails, onContinue }: Props) => {
    const [givenName, setGivenName] = useState<string>(userDetails.givenName);
    const [familyName, setFamilyName] = useState<string>(userDetails.familyName);
    const [phoneNumber, setPhoneNumber] = useState<string>(userDetails.phoneNumber);
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
        userDetails.dateOfBirth ? new Date(Date.parse(userDetails.dateOfBirth)) : undefined,
    );

    const [givenNameValid, setGivenNameValid] = useState<boolean>(false);
    const [familyNameValid, setFamilyNameValid] = useState<boolean>(false);
    const [phoneNumberValid, setPhoneNumberValid] = useState<boolean>(false);
    const [dateOfBirthValid, setDateOfBirthValid] = useState<boolean>(false);

    const shouldValidateOnStart = (): boolean => {
        return !!givenName || !!familyName || !!phoneNumber || !!dateOfBirth;
    };

    const isFormValid = (): boolean => {
        return givenNameValid && familyNameValid && phoneNumberValid && dateOfBirthValid;
    };

    const validatePhoneNumber = (phoneNumber: string): boolean => {
        const re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        return re.test(phoneNumber);
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ display: "flex", flexGrow: 1 }}>
                <KeyboardAvoidingView style={{ display: "flex", flex: 2, rowGap: 20, justifyContent: "center" }}>
                    <Text heading>About You</Text>
                    <SpTextInput
                        label="First name"
                        floatingPlaceholder
                        value={givenName}
                        validate={["required"]}
                        validationMessage={["First name is required"]}
                        enableErrors
                        validateOnBlur
                        validateOnStart={shouldValidateOnStart()}
                        validationMessagePosition="bottom"
                        onChangeValidity={setGivenNameValid}
                        placeholder="First Name"
                        onChangeText={setGivenName}
                    />
                    <SpTextInput
                        label="Last name"
                        floatingPlaceholder
                        validate={["required"]}
                        validationMessage={["Last name is required"]}
                        enableErrors
                        validateOnBlur
                        validateOnStart={shouldValidateOnStart()}
                        validationMessagePosition="bottom"
                        onChangeValidity={setFamilyNameValid}
                        value={familyName}
                        placeholder="Last Name"
                        onChangeText={setFamilyName}
                    />
                    <SpTextInput
                        label="Phone Number"
                        floatingPlaceholder
                        validate={["required", validatePhoneNumber]}
                        validationMessage={["Phone number is required", "Please enter a valid phone number"]}
                        enableErrors
                        validateOnBlur
                        validateOnStart={shouldValidateOnStart()}
                        inputMode="numeric"
                        validationMessagePosition="bottom"
                        onChangeValidity={setPhoneNumberValid}
                        value={phoneNumber}
                        placeholder="Phone Number"
                        onChangeText={setPhoneNumber}
                    />
                    <DateTimePicker
                        body
                        validate={["required"]}
                        floatingPlaceholder
                        // floatingPlaceholderStyle={[{ marginTop: -20, marginLeft: -4 }]}
                        floatingPlaceholderStyle={{ paddingTop: 16, paddingBottom: 4, paddingHorizontal: 15 }}
                        validationMessage={["Date of Birth is required"]}
                        maximumDate={new Date()}
                        retainValidationSpace={false}
                        validationMessageStyle={{ paddingHorizontal: 15, paddingTop: 5 }}
                        validateOnChange
                        validateOnStart={shouldValidateOnStart()}
                        onChangeValidity={setDateOfBirthValid}
                        style={styles.dateSelector}
                        placeholder="Date of Birth"
                        mode="date"
                        value={dateOfBirth}
                        onChange={setDateOfBirth}
                    />
                </KeyboardAvoidingView>

                <View style={{ display: "flex", flex: 1, justifyContent: "center", paddingBottom: 15 }}>
                    <Button
                        body
                        bg-primary
                        label="Continue"
                        disabled={!isFormValid()}
                        onPress={() => onContinue(givenName, familyName, phoneNumber, dateOfBirth!)}
                    />
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    label: {
        paddingHorizontal: 2,
        paddingBottom: 5,
        marginBottom: -19,
    },
    dateSelector: {
        height: 50,
        borderRadius: 25,
        width: _dimensions.width * 0.75,
        paddingHorizontal: 15,
        borderColor: _colorConfiguration.dividerDark,
        borderWidth: 1,
        justifyContent: "center",
    },
});
