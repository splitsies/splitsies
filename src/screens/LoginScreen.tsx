import React, { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet } from "react-native";
import { lazyInject } from "../utils/lazy-inject";
import { RootStackParamList } from "../types/params";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { Subscription } from "rxjs";
import { IUserCredential } from "@splitsies/shared-models";
import { LoginForm } from "../components/LoginForm";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { Container } from "../components/Container";
import { useInitialize } from "../hooks/use-initialize";
import { Text, View } from "react-native-ui-lib";
import pkg from "../../package.json";
import Config from "react-native-config";
import { IVersionManager } from "../managers/version-manager/version-manager-interface";

const _versionManager = lazyInject<IVersionManager>(IVersionManager);
const _userManager = lazyInject<IUserManager>(IUserManager);

type Props = NativeStackScreenProps<RootStackParamList, "LoginScreen">;

export const LoginScreen = SpThemedComponent(({ navigation }: Props) => {
    const [validationError, setValidationError] = useState<string>("");
    const attempts = useRef<number>(0);

    useInitialize(() => onConnect());

    const getEnvironmentSuffix = (): string => {
        const env = Config.STAGE;
        return env === "production" ? "" : `-${env}`;
    };

    const onConnect = () => {
        const subscription = new Subscription();
        subscription.add(_userManager.user$.subscribe({ next: (cred) => void onUserCredential(cred) }));

        return () => {
            attempts.current = 0;
            subscription.unsubscribe();
        };
    };

    const onLoginClicked = (e: string, p: string) => {
        attempts.current = attempts.current + 1;
        setValidationError("");
        _userManager.requestAuthenticate(e, p);
    };

    const onUserCredential = async (credential: IUserCredential | null) => {
        await _versionManager.initialized;
        if (_versionManager.requiresUpdate) return;

        if (!credential || !credential.authToken) {
            if (attempts.current > 0) {
                setValidationError("You've entered an incorrect username or password. Please try again.");
            }
            return;
        }

        navigation.navigate("RootScreen");
    };

    const onSignUpClicked = () => {
        navigation.navigate("SignupScreen");
    };

    return (
        <Container>
            <SafeAreaView style={styles.container}>
                <LoginForm
                    onLoginClicked={onLoginClicked}
                    onSignUpClicked={onSignUpClicked}
                    validationError={validationError}
                />
                <View style={styles.versionContainer}>
                    <Text hint>
                        {pkg.name} v{pkg.version}
                        {getEnvironmentSuffix()}
                    </Text>
                </View>
            </SafeAreaView>
        </Container>
    );
});

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
        justifyContent: "center",
        width: "100%",
    },
    versionContainer: {
        width: "100%",
        alignItems: "center",
        marginBottom: 5,
    },
});
