import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { RootComponent } from "./src/components/RootComponent";

function App(): JSX.Element {
    return (
        <NavigationContainer>
            <RootComponent />
        </NavigationContainer>
    );
}

export default App;
