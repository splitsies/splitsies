import { IExpenseUserDetails } from "@splitsies/shared-models";
import React, { useState } from "react";
import { Carousel, Colors, PageControl } from "react-native-ui-lib";
import { View } from "react-native-ui-lib/core";
import { PersonalOrder } from "./PersonalOrder";
import { Dimensions, StyleSheet } from "react-native";
import { SelectItemsModal } from "./SelectItemsModal";
import { Container } from "./Container";
import { IExpense } from "../models/expense/expense-interface";
import { lazyInject } from "../utils/lazy-inject";
import { IUiConfiguration } from "../models/configuration/ui-configuration/ui-configuration-interface";

const _uiConfig = lazyInject<IUiConfiguration>(IUiConfiguration);

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
        <Container style={styles.container}>
            <View style={{ display: "flex", flex: 1 }}>
                <Carousel
                    onChangePage={onChangePage}
                    disableIntervalMomentum
                    pagingEnabled
                    itemSpacings={_uiConfig.sizes.carouselPadding}
                    containerStyle={{ width: "100%", alignItems: "center" }}
                >
                    {people.map((person) => (
                        <PersonalOrder key={person.id} person={person} expense={expense} />
                    ))}
                </Carousel>
            </View>

            <View style={{ display: "flex" }}>
                <PageControl
                    containerStyle={{ paddingVertical: 15 }}
                    color={Colors.textColor}
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
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
    },
});
