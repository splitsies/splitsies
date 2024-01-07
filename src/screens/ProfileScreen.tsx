import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Dimensions, SafeAreaView, StyleSheet } from "react-native";
import { lazyInject } from "../utils/lazy-inject";
import { DrawerParamList, RootStackScreenParams } from "./root-stack-screen-params";
import { IUserManager } from "../managers/user-manager/user-manager-interface";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { CompositeScreenProps } from "@react-navigation/native";
import { useObservable } from "../hooks/use-observable";
import { SpTextInput } from "../components/SpTextInput";
import { Button, Colors, View } from "react-native-ui-lib";
import QRCode from "react-native-qrcode-svg";
import { IQrPayload } from "../models/qr-payload/qr-payload-interface";
import { QrPayload } from "../models/qr-payload/qr-payload";
import { useThemeWatcher } from "../hooks/use-theme-watcher";

const _userManager = lazyInject<IUserManager>(IUserManager);
const _dimensions = Dimensions.get("screen");

type Props = CompositeScreenProps<
    NativeStackScreenProps<RootStackScreenParams>,
    DrawerScreenProps<DrawerParamList, "Profile">
>;

export const ProfileScreen = ({ navigation }: Props) => {
    useThemeWatcher();
    const user = useObservable(_userManager.user$, _userManager.user);
    const [payload, setPayload] = useState<IQrPayload>(
        new QrPayload(user?.user.id || "", user?.user.givenName || "", user?.user.familyName || ""),
    );

    useEffect(() => {
        if (!user) return;
        setPayload(new QrPayload(user.user.id, user.user.givenName, user.user.familyName));
    }, [user]);

    const onSignOut = () => {
        void _userManager.signOut();
    };

    return user?.user ? (
        <SafeAreaView style={styles.container}>
            <View style={{ display: "flex", flexGrow: 1 }} bg-screenBG>
                <View style={{ display: "flex", flex: 2, rowGap: 10, justifyContent: "center", alignItems: "center" }}>
                    <QRCode
                        value={JSON.stringify(payload)}
                        color={Colors.screenBG}
                        backgroundColor={Colors.textColor}
                    />
                    <SpTextInput readonly value={user.user.givenName} placeholder="First Name" />
                    <SpTextInput readonly value={user.user.familyName} placeholder="Last Name" />
                    <SpTextInput readonly value={user.user.email} placeholder="Email" />
                    <SpTextInput readonly value={user.user.phoneNumber} placeholder="Phone Number" />

                    <View style={{ display: "flex", flex: 1, justifyContent: "center", paddingBottom: 15 }}>
                        <Button
                            body
                            bg-primary
                            label="Sign Out"
                            onPress={onSignOut}
                            style={{ width: _dimensions.width * 0.75 }}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    ) : null;
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexGrow: 1,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 20,
        marginVertical: 20,
    },
});
