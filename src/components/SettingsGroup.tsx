import React from "react";
import { View, Text } from "react-native-ui-lib/core";
import { Colors } from "react-native-ui-lib";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

type Props = {
    name: string;
    children: React.ReactNode;
    style?: object;
};

export const SettingsGroup = SpThemedComponent(({ name, style, children }: Props) => {
    return (
        <View style={style}>
            <Text hint marginB-5 marginL-16>
                {name.toUpperCase()}
            </Text>
            <View style={{ borderColor: Colors.divider, borderWidth: 1, borderRadius: 30, paddingVertical: 20 }}>
                {children}
            </View>
        </View>
    );
});
