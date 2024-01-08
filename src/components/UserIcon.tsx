import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "react-native-ui-lib";

type propTypes = {
    letter: string;
    style: { [key: string]: any };
    labelStyle?: { [key: string]: any };
};

export const UserIcon = ({ letter, style, labelStyle }: propTypes) => {
    return (
        <View style={[styles.container, style]} bg-primary>
            <Text letter style={[labelStyle, styles.text]}>
                {letter}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 30,
        height: 30,
        borderRadius: 30 / 2,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "black",
    },
});
