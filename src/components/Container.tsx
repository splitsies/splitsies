import React from "react";
import { View } from "react-native-ui-lib/core";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { SafeAreaView } from "react-native";

type Props = {
    useSafeArea?: boolean;
    children?: React.ReactNode;
};

export const Container = SpThemedComponent(({ children, useSafeArea }: Props): JSX.Element => {
    return useSafeArea ? (
        <View bg-screenBG flex-1>
            <SafeAreaView>
                {children}
            </SafeAreaView>
        </View> 
        ) : (
        <View bg-screenBG flex-1>
            {children}
        </View>
    );
});
