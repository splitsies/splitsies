/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { IExpenseManager } from './src/managers/expense-manager/expense-manager-interface';
import { lazyInject } from './src/utils/lazy-inject';
import { IUserManager } from './src/managers/user-manager/user-manager-interface';
import { ExpensePreview } from './src/components/ExpensePreview';
import { IThemeManager } from './src/managers/theme-manager/theme-manager-interface';

import { Text } from "react-native-ui-lib";

lazyInject<IThemeManager>(IThemeManager).initialize();

function App(): JSX.Element {
    const _userManager = lazyInject<IUserManager>(IUserManager);

    const _expenseManager = lazyInject<IExpenseManager>(IExpenseManager);
    const [expenses, setExpenses] = useState(_expenseManager.expenses);

    const isDarkMode = useColorScheme() === 'dark';
    useEffect(() => { console.log(expenses) }, [expenses]);
    useEffect(() => onConnect(), []);
    const onConnect = () => {
        const subscription = _expenseManager.expenses$.subscribe({
            next: data => setExpenses(data)
        });

        _userManager.initialized.then(() => {
            if (!_userManager.user) { 
                console.log("Need to authenticate");
                return;
            }
    
            void _expenseManager.requestForUser(_userManager.user.user.id);
            console.log(`authenticated successfully. user is ${_userManager.user}`);
        });
        
        return () => subscription.unsubscribe();
    }
    
    

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
              style={backgroundStyle}>
              <Text primary body>The quick brown fox jumped over the lazy dog</Text>
        {/* <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
                  {expenses.map(e => <ExpensePreview data={e} onPress={(id) => console.log(id)}  onLongPress={() => console.log("LONG")} />)}
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
