import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { Colors, Text, TextField } from "react-native-ui-lib";
import { TouchableOpacity, View } from "react-native-ui-lib/core";
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
import Add from "../../assets/icons/add.svg";
import Collapse from "../../assets/icons/collapse.svg";
import { IExpenseManager } from "../managers/expense-manager/expense-manager-interface";
import { EditModal } from "./EditModal";
import { EditResult } from "../models/edit-result";
import { EditItemsControl } from "./EditItemsControl";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);
const _expenseViewModel = lazyInject<IExpenseViewModel>(IExpenseViewModel);
const _inviteViewModel = lazyInject<IInviteViewModel>(IInviteViewModel);
const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);

const icon = _uiConfig.sizes.icon;

export const ExpenseNavigatorHeader = () => {
    const currentExpense = useObservable(_expenseManager.currentExpense$, _expenseManager.currentExpense);
    const selectedChild = useObservable(_expenseViewModel.selectedChild$, undefined);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const searchVisible = useObservable(_expenseViewModel.searchVisible$, false);
    const searchFilter = useObservable(_inviteViewModel.searchFilter$, _inviteViewModel.searchFilter);
    const screen = useObservable(_expenseViewModel.screen$, "Items");

    const [actionWidth, setActionWidth] = useState<number>(40);
    const [arrowWidth, setArrowWidth] = useState<number>(40);
    const centerOffset = useSharedValue<number>(0);

    const animatedPadding = useAnimatedStyle(() => ({
        transform: [{ translateX: centerOffset.value }],
    }));

    useEffect(() => {
        centerOffset.value = withSpring((actionWidth - arrowWidth) / 2, { duration: 500 });
    }, [actionWidth, arrowWidth]);

    const onAddPress = () => {
        Alert.alert(`Create an empty expense?`, "", [
            { text: "Yes", onPress: () => void onCreateExpense() },
            { text: "No", style: "cancel" },
        ]);
    };

    const onCreateExpense = async () => {
        _expenseViewModel.setAwaitingResponse(true);
        await _expenseManager.createExpense();
        _expenseViewModel.setAwaitingResponse(false);
    };

    const onTitleSave = ({ name }: EditResult) => {
        if (selectedChild) {
            _expenseManager.updateExpenseName(selectedChild.id, name ?? "");
        } else {
            _expenseManager.updateExpenseName(currentExpense!.id, name ?? "");
        }

        setEditingTitle(false);
        _expenseViewModel.setAwaitingResponse(true);
    };

    return (
        <SafeAreaView>
            <View style={styles.header} bg-screenBG>
                <View style={[styles.arrowContainer, {}]} onLayout={(e) => setArrowWidth(e.nativeEvent.layout.width)}>
                    {!selectedChild ? (
                        <TouchableOpacity onPress={() => _expenseViewModel.onBackPress()}>
                            <ArrowBack
                                height={_uiConfig.sizes.icon}
                                width={_uiConfig.sizes.icon}
                                fill={Colors.textColor}
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => _expenseViewModel.setSelectedChild(undefined)}>
                            <Collapse
                                height={_uiConfig.sizes.icon}
                                width={_uiConfig.sizes.icon}
                                fill={Colors.textColor}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <Animated.View style={[styles.inputContainer, animatedPadding]}>
                    {searchVisible ? (
                        <TextField
                            body
                            autoCapitalize="none"
                            bg-screenBG
                            placeholder="Search"
                            placeholderTextColor={_colorConfiguration.greyFont}
                            value={searchFilter}
                            containerStyle={{ width: "100%" }}
                            style={styles.textInput}
                            onChangeText={(text) => _inviteViewModel.setSearchFilter(text)}
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setEditingTitle(!editingTitle)}>
                            <Text
                                letterSubheading
                                color={Colors.textColor}
                                style={[styles.headerLabel]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.75}
                            >
                                {selectedChild?.name ?? currentExpense!.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>

                <View style={[styles.actionContainer, {}]} onLayout={(e) => setActionWidth(e.nativeEvent.layout.width)}>
                    {screen === "Items" &&
                        (currentExpense?.children.length === 0 || !!selectedChild ? (
                            <EditItemsControl />
                        ) : (
                            <View>
                                <TouchableOpacity onPress={onAddPress}>
                                    <Add width={icon} height={icon} fill={Colors.textColor} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    {screen === "People" && (currentExpense?.children.length === 0 || !!selectedChild) && (
                        <SelectItemsControl />
                    )}
                    {screen === "Guests" && <AddGuestControl />}
                    {(screen === "Contacts" || screen === "Search") && <ScanUserQrControl />}
                </View>
            </View>

            <EditModal
                visible={editingTitle}
                nameValue={selectedChild?.name ?? currentExpense!.name}
                onSave={onTitleSave}
                onCancel={() => setEditingTitle(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    headerLabel: {
        textAlign: "center",
        minWidth: 200,
        minHeight: 30,
    },
    arrowContainer: {
        display: "flex",
        flexDirection: "row",
        minWidth: 40,
        columnGap: 10,
        alignItems: "center",
        height: 50,
        paddingRight: 5,
    },
    actionContainer: {
        display: "flex",
        height: 50,
        minWidth: 40,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingLeft: 5,
    },
    inputContainer: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    textInput: {
        display: "flex",
        flexGrow: 1,
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: _colorConfiguration.divider,
    },
});
