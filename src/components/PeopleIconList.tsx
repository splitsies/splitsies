import React, { useEffect, useRef, useState } from "react";
import { Colors, Text, View } from "react-native-ui-lib/core";
import { SpThemedComponent } from "../hocs/SpThemedComponent";
import { UserIcon } from "./UserIcon";
import { IExpense } from "../models/expense/expense-interface";
import { Dimensions, StyleSheet } from "react-native";

type Props = {
    expense: IExpense;
    setPeopleContainerWidth: (width: number) => void;
    personLimit: number;
    style?: object;
};

export const PeopleIconList = SpThemedComponent(({ style, expense }: Props) => {
    const [peopleContainerWidth, setPeopleContainerWidth] = useState<number>(Dimensions.get("window").width);
    const [personLimit, setPersonLimit] = useState<number>(Math.floor((peopleContainerWidth - 20) / 34) - 1);
    const layoutFulfilled = useRef<boolean>(false);

    useEffect(() => {
        setPersonLimit(Math.floor((peopleContainerWidth - 20) / 34) - 1);
    }, [peopleContainerWidth]);

    return (
        <View
            style={[styles.peopleContainer, style]}
            onLayout={({ nativeEvent }) => {
                if (layoutFulfilled.current) return;
                layoutFulfilled.current = true;
                setPeopleContainerWidth(nativeEvent.layout.width);
            }}
        >
            {expense.users.length === 0 && <Text hint>None</Text>}
            {expense.users.length > personLimit
                ? expense.users
                      .slice(0, personLimit)
                      .map(({ id, givenName }) => (
                          <UserIcon key={id} letter={givenName[0]} style={{ marginRight: 6 }} />
                      ))
                : expense.users.map(({ id, givenName }) => (
                      <UserIcon key={id} letter={givenName[0]} style={{ marginRight: 6 }} />
                  ))}

            {expense.users.length > personLimit && (
                <Text body color={Colors.textColor}>
                    + {expense.users.length - personLimit}
                </Text>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    peopleContainer: {
        flexDirection: "row",
        marginVertical: 5,
        alignItems: "center",
    },
});
