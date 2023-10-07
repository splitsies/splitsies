import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react"
import {  } from "react-native";
import { Text, View, TouchableOpacity, Button } from "react-native-ui-lib/core"


type Params = {    
    HomeScreen: any;
    LoginScreen: any;
};

type Props = NativeStackScreenProps<Params, "LoginScreen">;

export const LoginScreen = ({ navigation }: Props) => {
    return (
        <View>
            <Text letterHeading>Login to begin!</Text>

            <Button
                label="Go home"                
                onPress={() => navigation.navigate("HomeScreen")}
                bg-primary
            />
        </View>
    );
};