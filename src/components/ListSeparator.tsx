import React from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native-ui-lib/core";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

export const ListSeparator = (): JSX.Element => {
    return (
        <View style={{ width: "100%" }} flex centerH>
            <View style={styles.separator} />
        </View>
    );
};

const styles = StyleSheet.create({
    separator: {
        height: 1,
        width: "100%",
        backgroundColor: _colorConfiguration.greyFont,
        marginTop: 10,
        marginBottom: 10,
        opacity: 0.33,
    },
});
