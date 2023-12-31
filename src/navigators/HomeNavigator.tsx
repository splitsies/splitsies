import React from "react";
import { RootDrawerContent } from "../components/RootDrawerContent";
import { ProfileScreen } from "../screens/ProfileScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IStyleManager } from "../managers/style-manager/style-manager-interface";
import { TouchableOpacity, View } from "react-native-ui-lib/core";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Icon } from "react-native-ui-lib";
import { SplitsiesTitle } from "../components/SplitsiesTitle";
import { IHomeViewModel } from "../view-models/home-view-model/home-view-model-interface";
import { useObservable } from "../hooks/use-observable";
import { FeedNavigator } from "./FeedNavigator";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _styleManager = lazyInject<IStyleManager>(IStyleManager);
const _viewModel = lazyInject<IHomeViewModel>(IHomeViewModel);

const Drawer = createDrawerNavigator();

export const HomeNavigator = () => {
    const pendingData = useObservable(_viewModel.pendingData$, false);

    const Header = ({ navigation }: any) => {
        return (
            <View style={styles.header}>
                <SplitsiesTitle />
                <View row style={{ columnGap: 10 }}>
                    <ActivityIndicator color={_colorConfiguration.black} animating={pendingData} hidesWhenStopped />
                    <TouchableOpacity onPress={navigation.openDrawer}>
                        <Icon assetName="menu" size={27} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <Drawer.Navigator
            initialRouteName="Home"
            drawerContent={RootDrawerContent}
            screenOptions={{
                drawerPosition: "right",
                drawerActiveTintColor: _colorConfiguration.black,
                drawerActiveBackgroundColor: _colorConfiguration.primaryTranslucentLight,
                drawerLabelStyle: _styleManager.typography.body,
                header: Header,
            }}
        >
            <Drawer.Screen name="Home" component={FeedNavigator} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 20,
        marginVertical: 20,
    },
});
