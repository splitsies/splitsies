import React from "react";
import { StyleSheet } from "react-native";
import { Icon, Text } from "react-native-ui-lib";
import { View } from "react-native-ui-lib/core";

type Props = {
    center?: boolean;
    style?: object;
};

export const SplitsiesTitle = ({ center, style }: Props): JSX.Element => {
    return (
        <View flex-2 row bottom centerH={center} style={style}>
            <Icon assetName="logoBlack" size={50} />
            <Text letterHeading black style={styles.logo}>
                plitsies
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    logo: {
        marginLeft: -10,
    },
});
