import { IExpense, IExpenseUserDetails } from "@splitsies/shared-models";
import React, { useState } from "react";
import { Carousel, PageControl, PageControlPosition } from "react-native-ui-lib";
import { View } from "react-native-ui-lib/core";
import { PersonalOrder } from "./PersonalOrder";
import { Dimensions, StyleSheet } from "react-native";
import { lazyInject } from "../utils/lazy-inject";
import { IColorConfiguration } from "../models/configuration/color-config/color-configuration-interface";
import { SelectItemsModal } from "./SelectItemsModal";

const _colorConfiguration = lazyInject<IColorConfiguration>(IColorConfiguration);
const _dimensions = Dimensions.get("window");

type Props = {
    isSelecting: boolean;
    endSelectingMode: () => void;
    people: IExpenseUserDetails[];
    expense: IExpense;
    updateItemOwners: (userId: string, itemIds: string[]) => void;
};

export const People = ({ isSelecting, people, expense, updateItemOwners, endSelectingMode }: Props): JSX.Element => {
    const [pageIndex, setPageIndex] = useState<number>(0);
    const [selectedUser, setSelectedUser] = useState<IExpenseUserDetails>(people[pageIndex]);

    const onCloseSelectItems = (itemIds: string[]): void => {
        if (!selectedUser) {
            return;
        }
        updateItemOwners(selectedUser.id, itemIds);
        endSelectingMode();
    };

    const onChangePage = (newPageIndex: number): void => {
        setSelectedUser(people[newPageIndex]);
        setPageIndex(newPageIndex);
    };

    return (
        <View style={styles.container}>
            <View style={{ display: "flex", flex: 1 }}>
                <Carousel
                    onChangePage={onChangePage}
                    itemSpacings={20}
                    containerStyle={{ width: "100%", alignItems: "center" }}
                    pageWidth={_dimensions.width - 40}
                >
                    {people.map((person) => (
                        <PersonalOrder key={person.id} person={person} expense={expense} />
                    ))}
                </Carousel>
            </View>

            <View style={{ display: "flex" }}>
                <PageControl
                    containerStyle={{ paddingVertical: 15 }}
                    color={_colorConfiguration.black}
                    numOfPages={people.length}
                    currentPage={pageIndex}
                />
            </View>

            <SelectItemsModal
                visible={isSelecting}
                user={selectedUser}
                expense={expense}
                onClose={onCloseSelectItems}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        flexGrow: 1,
        paddingTop: 10,
    },
});
