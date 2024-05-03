import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Colors, TextField } from "react-native-ui-lib";
import { TouchableOpacity, View } from "react-native-ui-lib/core";
import { EditItemsControl } from "./EditItemsControl";
import { useObservable } from "../hooks/use-observable";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IExpenseViewModel } from "../view-models/expense-view-model/expense-view-model-interface";
import { IInviteViewModel } from "../view-models/invite-view-model/invite-view-model-interface";
import { AddGuestControl } from "./AddGuestControl";
import { ScanUserQrControl } from "./ScanUserQrControl";
import { SelectItemsControl } from "./SelectItemsControl";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import ArrowBack from "../../assets/icons/arrow-back.svg";

const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);

export const ExpenseNavigationHeader = () => {
    const searchVisible = useObservable(_expenseViewModel.searchVisible$, false);
    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);
    const screen = useObservable(_expenseViewModel.screen$, "Items");

    return (
        <SafeAreaView>
            <View style={styles.header} bg-screenBG>
                <View style={styles.arrowContainer}>
                    <TouchableOpacity onPress={() => _expenseViewModel.onBackPress()}>
                        <ArrowBack height={_uiConfig.sizes.icon} width={_uiConfig.sizes.icon} fill={Colors.textColor} />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    {searchVisible && (
                        <TextField
                            body
                            autoCapitalize="none"
                            bg-screenBG
                            placeholder="Search"
                            placeholderTextColor={_colorConfiguration.greyFont}
                            value={searchFilter}
                            style={styles.textInput}
                            onChangeText={(text) => _inviteViewModel.setSearchFilter(text)}
                        />
                    )}
                </View>

                <View style={styles.actionContainer}>
                    {screen === "Items" && <EditItemsControl />}
                    {screen === "People" && <SelectItemsControl />}
                    {screen === "Guests" && <AddGuestControl />}
                    {(screen === "Contacts" || screen === "Search") && <ScanUserQrControl />}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    arrowContainer: {
        display: "flex",
        height: 50,
        justifyContent: "center",
        paddingRight: 5,
    },
    actionContainer: {
        display: "flex",
        height: 50,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingLeft: 5,
    },
    inputContainer: {
        display: "flex",
        flex: 1,
        height: 50,
    },
    textInput: {
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: _colorConfiguration.divider,
    },
});
