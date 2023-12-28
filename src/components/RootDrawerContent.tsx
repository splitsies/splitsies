import React from "react";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Text, View } from "react-native-ui-lib";
import { SafeAreaView, StyleSheet } from "react-native";
import pkg from "../../package.json";
import Config from "react-native-config";

export const RootDrawerContent = (props: any) => {
    const getEnvironmentSuffix = (): string => {
        const env = Config.STAGE;
        return env === "production" ? "" : `-${env}`;
    };

    return (
        <View style={styles.container}>
            <DrawerContentScrollView style={styles.scrollView} {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            <SafeAreaView style={styles.versionContainer}>
                <Text hint>
                    {pkg.name} v{pkg.version}
                    {getEnvironmentSuffix()}
                </Text>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        height: "100%",
        width: "100%",
        paddingTop: 0,
        marginTop: 0,
    },
    scrollView: {
        display: "flex",
        width: "100%",
        flexGrow: 1,
        flex: 1,
    },
    versionContainer: {
        width: "100%",
        alignItems: "center",
    },
});
