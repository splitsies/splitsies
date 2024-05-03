import React, { useCallback } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Linking, ScrollView, Settings, StyleSheet } from "react-native";
import { lazyInject } from "../utils/lazy-inject";
import { DrawerParamList, RootStackParamList } from "../types/params";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { CompositeScreenProps } from "@react-navigation/native";
import { Colors, Switch, Text, View } from "react-native-ui-lib";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { Container } from "../components/Container";
import { ISettingsManager } from "../managers/settings-manager/settings-manager-interface";
import SettingsConfiguration from "../config/settings.config.json";
import { useObservable } from "../hooks/use-observable";
import { SettingsGroup } from "../components/SettingsGroup";
import ChevronRight from "../../assets/icons/chevron-right.svg";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { TouchableOpacity } from "react-native-gesture-handler";

const _settingsManager = lazyInject<ISettingsManager>(ISettingsManager);
const {
    sizes: { icon },
} = lazyInject<IUiConfiguration>(IUiConfiguration);

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList>,
    DrawerScreenProps<DrawerParamList, "Settings">
>;

export const SettingsScreen = SpThemedComponent(({ navigation }: Props) => {
    const joinRequestNotificationsAllowed = useObservable<boolean>(
        _settingsManager.joinRequestNotificationsAllowed$,
        false,
    );

    const openSettings = useCallback(() => {
        void Linking.openSettings();
    }, []);

    return (
        <Container useSafeArea>
            <ScrollView style={{ paddingHorizontal: 20, height: "100%" }}>
                <SettingsGroup name={SettingsConfiguration.pushNotifications.displayName}>
                    <View style={[styles.settingsItem, { marginTop: 0, marginBottom: 0 }]}>
                        <Text body>{SettingsConfiguration.pushNotifications.joinRequestNotifications.displayName}</Text>
                        <Switch
                            onColor={Colors.primary}
                            value={joinRequestNotificationsAllowed}
                            onValueChange={_settingsManager.setJoinRequestNotificationsAllowed.bind(_settingsManager)}
                        />
                    </View>
                </SettingsGroup>

                <SettingsGroup name="App Settings" style={{ marginTop: 20 }}>
                    <TouchableOpacity onPress={openSettings}>
                        <View style={[styles.settingsItem, { marginTop: 0, marginBottom: 0 }]}>
                            <Text body>Open App Settings</Text>
                            <ChevronRight width={icon} height={icon} fill={Colors.textColor} />
                        </View>
                    </TouchableOpacity>
                </SettingsGroup>
            </ScrollView>
        </Container>
    );
});

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
    },
    settingsItem: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        marginVertical: 12,
    },
});
