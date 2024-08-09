import React from "react";
import { Colors, Text, TouchableOpacity, View } from "react-native-ui-lib/core";
import { TutorialTip } from "./TutorialTip";
import { StyleSheet } from "react-native";
import More from "../../assets/icons/more.svg";
import { lazyInject } from "../utils/lazy-inject";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { IExpenseUserDetails } from "@splitsies/shared-models";
import { SpThemedComponent } from "../hocs/SpThemedComponent";

const icon = lazyInject<IUiConfiguration>(IUiConfiguration).sizes.smallIcon;

type Props = {
    iconContent?: () => React.ReactNode;
    person: IExpenseUserDetails;
    isSelected: boolean;
    setActionsVisible: (value: boolean) => void;
};

export const CardHeader = SpThemedComponent(
    ({ iconContent, person, isSelected, setActionsVisible }: Props): React.ReactNode => {
        return (
            <View style={{ alignItems: "center" }}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>{iconContent?.()}</View>

                    <View style={styles.nameContainer}>
                        <Text body numberOfLines={1} ellipsizeMode={"tail"} color={Colors.textColor}>
                            {person.givenName + (person.familyName ? " " + person.familyName : "")}
                        </Text>
                    </View>

                    <View style={[styles.iconContainer, { columnGap: 5, justifyContent: "flex-end" }]}>
                        {isSelected ? (
                            <TutorialTip group="people" stepKey="menu" placement="bottom">
                                <TouchableOpacity onPress={() => setActionsVisible(true)}>
                                    <More width={icon} height={icon} fill={Colors.textColor} />
                                </TouchableOpacity>
                            </TutorialTip>
                        ) : (
                            <TouchableOpacity onPress={() => setActionsVisible(true)}>
                                <More width={icon} height={icon} fill={Colors.textColor} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    },
);

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: 5,
    },
    iconContainer: {
        overflow: "visible",
        flexDirection: "row",
        alignItems: "center",
        width: 35,
    },
    nameContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
    },
});
