import React from "react";
import { View } from "react-native-ui-lib/core";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

type Props = {
    children?: React.ReactNode;
};

export const Container = SpThemedComponent(({ children }: Props): JSX.Element => {
    return (
        <View bg-screenBG flex-1>
            {children}
        </View>
    );
});
