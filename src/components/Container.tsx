import React from "react";
import { View } from "react-native-ui-lib/core";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { SafeAreaView } from "react-native";

type Props = {
    useSafeArea?: boolean;
    children?: React.ReactNode;
    style?: object;
};

export const Container = SpThemedComponent(({ children, useSafeArea, style }: Props): JSX.Element => {
    return useSafeArea ? (
        <View bg-screenBG flex-1 style={style}>
            <SafeAreaView>
                {children}
            </SafeAreaView>
        </View> 
        ) : (
        <View bg-screenBG flex-1 style={style}>
            {children}
        </View>
    );
});
