import React, { useState } from "react";
import { lazyInject } from "./src/utils/lazy-inject";
import { IStyleManager } from "./src/managers/style-manager/style-manager-interface";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { IUserManager } from "./src/managers/user-manager/user-manager-interface";

lazyInject<IStyleManager>(IStyleManager).initialize();
const _userManager = lazyInject<IUserManager>(IUserManager);


const Stack = createNativeStackNavigator();

function App(): JSX.Element {

    const [initialRoute, setInitialRoute] = useState<"HomeScreen" | "LoginScreen">("LoginScreen");
    // TODO: Splash screen while we wait
    _userManager.initialized.then(() => {
        setInitialRoute(_userManager.user ? "HomeScreen" : "LoginScreen");
        _userManager.user$.subscribe({
            next: (credential) => setInitialRoute(credential ? "HomeScreen" : "LoginScreen")
        });
    });

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="HomeScreen">
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
