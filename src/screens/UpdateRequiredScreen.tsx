import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Linking, Platform, SafeAreaView, StyleSheet } from "react-native";
import { RootStackParamList } from "../types/params";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { Button, Text, View } from "react-native-ui-lib";
import { SplitsiesTitle } from "../components/SplitsiesTitle";
import pkg from "../../package.json";
import Config from "react-native-config";
import LinksConfiguration from "../config/links.config.json";

type Props = NativeStackScreenProps<RootStackParamList, "LoginScreen">;

export const UpdateRequiredScreen = SpThemedComponent(({ navigation }: Props) => {
    const getEnvironmentSuffix = (): string => {
        const env = Config.STAGE;
        return env === "production" ? "" : `-${env}`;
    };

    const onUpdatePressed = () => {
        Linking.openURL(Platform.OS === "ios" ? LinksConfiguration.appStore : LinksConfiguration.playStore);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ display: "flex", flex: 4, justifyContent: "center" }}>
                <SplitsiesTitle style={{ flex: 0, marginTop: 0 }} />
                <Text letterHeading marginT-35 marginB-10 marginL-10 style={{ fontSize: 32 }}>
                    Time for an upgrade!
                </Text>
                <Text hint marginL-10>
                    A new app version is available. Update now to get the latest and greatest features.
                </Text>
            </View>

            <View style={styles.versionContainer}>
                <Button
                    style={styles.input}
                    body
                    marginB-10
                    labelStyle={{ color: "black" }}
                    label="Update"
                    onPress={onUpdatePressed}
                    bg-primary
                    size="large"
                />
                <Text hint>
                    {pkg.name} v{pkg.version}
                    {getEnvironmentSuffix()}
                </Text>
            </View>
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
        marginHorizontal: 25,
    },
    subcontainer: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
        justifyContent: "center",
        backgroundColor: "blue",
    },
    versionContainer: {
        display: "flex",
        flex: 1,
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
        marginBottom: 5,
    },
    input: {
        display: "flex",
        width: "75%",
    },
});
