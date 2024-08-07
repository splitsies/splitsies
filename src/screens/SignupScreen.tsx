import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Keyboard, SafeAreaView, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Colors, Icon, Wizard, WizardStepStates } from "react-native-ui-lib";
import { TouchableOpacity, View } from "react-native-ui-lib/core";
import { RootStackParamList } from "../types/params";
import { lazyInject } from "../utils/lazy-inject";
import { UserDetailsForm } from "../components/UserDetailsForm";
import { CreateUserRequest, IUserDto } from "@splitsies/shared-models";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { LoginDetailsForm } from "../components/LoginDetailsForm";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { Container } from "../components/Container";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

import ArrowBack from "../../assets/icons/arrow-back.svg";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _userManager = lazyInject<IUserManager>(IUserManager);
const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = NativeStackScreenProps<RootStackParamList, "SignupScreen">;

export const SignupScreen = SpThemedComponent(({ navigation }: Props): JSX.Element => {
    const [wizardIndex, setWizardIndex] = useState<number>(0);
    const [lastCompletedStepIndex, setLastCompletedStepIndex] = useState<number | null>(null);
    const [userDetails, setUserDetails] = useState<CreateUserRequest>({
        givenName: "",
        familyName: "",
        phoneNumber: "",
        email: "",
        dateOfBirth: "",
        password: "",
        username: "",
    });

    const onBackPress = (): void => {
        navigation.goBack();
    };

    const onUserDetailsCompleted = (
        givenName: string,
        familyName: string,
        phoneNumber: string,
        dateOfBirth: Date,
    ): void => {
        setUserDetails({ ...userDetails, givenName, familyName, phoneNumber, dateOfBirth: dateOfBirth?.toISOString() });
        if (!lastCompletedStepIndex || lastCompletedStepIndex < wizardIndex) {
            setLastCompletedStepIndex(wizardIndex);
        }
        setWizardIndex(wizardIndex + 1);
    };

    const onLoginDetailsCompleted = async (email: string, username: string, password: string): Promise<void> => {
        const updatedUserDetails = { ...userDetails, email, password, username };
        setUserDetails(updatedUserDetails);

        const result = await _userManager.requestCreateUser(updatedUserDetails);
        if (!result.success) {
            if (result.error) {
                Alert.alert("Error", result.error);
                return;
            }

            Alert.alert("Error", "Unable to create an account. Please try again later.");
        }
    };

    const provideWizardStepComponent = (index: number): JSX.Element => {
        switch (index) {
            case 0:
                return <UserDetailsForm userDetails={userDetails} onContinue={onUserDetailsCompleted} />;
            case 1:
                return <LoginDetailsForm userDetails={userDetails} onComplete={onLoginDetailsCompleted} />;
        }

        throw new Error();
    };

    const provideWizardStepState = (index: number): WizardStepStates => {
        let state = Wizard.States.DISABLED;

        if (lastCompletedStepIndex != null && lastCompletedStepIndex >= index) {
            state = Wizard.States.COMPLETED;
        } else if (wizardIndex === index || lastCompletedStepIndex === index - 1) {
            state = Wizard.States.ENABLED;
        }

        return state;
    };

    return (
        <Container>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBackPress}>
                        <ArrowBack width={_uiConfig.sizes.icon} height={_uiConfig.sizes.icon} fill={Colors.textColor} />
                    </TouchableOpacity>

                    <Wizard
                        activeIndex={wizardIndex}
                        containerStyle={styles.wizard}
                        onActiveIndexChanged={setWizardIndex}
                    >
                        <Wizard.Step
                            color={_colorConfiguration.black}
                            circleBackgroundColor={_colorConfiguration.primary}
                            circleColor={_colorConfiguration.primary}
                            state={provideWizardStepState(0)}
                            label={"Personal Info"}
                        />
                        <Wizard.Step
                            color={_colorConfiguration.dividerDark}
                            circleBackgroundColor={_colorConfiguration.primary}
                            circleColor={_colorConfiguration.primary}
                            state={provideWizardStepState(1)}
                            label={"Login Info"}
                        />
                    </Wizard>
                </View>

                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={styles.stepContainer}>{provideWizardStepComponent(wizardIndex)}</View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </Container>
    );
});

const styles = StyleSheet.create({
    container: {
        display: "flex",
        height: "100%",
        width: "100%",
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 15,
        paddingTop: 20,
        width: "100%",
    },
    wizard: {
        backgroundColor: "rgba(0,0,0,0)",
        paddingHorizontal: 45,
        borderWidth: 0,
        borderColor: "rgba(0,0,0,0)",
        elevation: 0,
    },
    stepContainer: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
