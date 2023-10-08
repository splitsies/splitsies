import React, { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lazyInject } from "../utils/lazy-inject";
import { RootStackScreenParams } from "./root-stack-screen-params";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { Subscription } from "rxjs";
import { IUserCredential } from "@splitsies/shared-models";
import { LoginForm } from "../components/LoginForm";

const _userManager = lazyInject<IUserManager>(IUserManager);

type Props = NativeStackScreenProps<RootStackScreenParams, "LoginScreen">;

export const LoginScreen = ({ navigation }: Props) => {
    const [validationError, setValidationError] = useState<string>("");
    const attempts = useRef<number>(0);

    useEffect(() => onConnect(), []);

    const onConnect = () => {
        const subscription = new Subscription();
        subscription.add(_userManager.user$.subscribe({ next: (cred) => onUserCredential(cred) }));
        return () => subscription.unsubscribe();
    };

    const onLoginClicked = (e: string, p: string) => {
        attempts.current = attempts.current + 1;
        setValidationError("");
        _userManager.requestAuthenticate(e, p);
    };

    const onUserCredential = (credential: IUserCredential | null) => {
        if (!credential || !credential.authToken) {
            if (attempts.current > 0) {
                setValidationError("You've entered an incorrect username or password. Please try again.");
            }
            return;
        }

        navigation.navigate("HomeScreen");
    };

    const onSignUpClicked = () => {};

    return (
        <SafeAreaView style={styles.container}>
            <LoginForm
                onLoginClicked={onLoginClicked}
                onSignUpClicked={onSignUpClicked}
                validationError={validationError}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
        justifyContent: "center",
        width: "100%",
    },
});
