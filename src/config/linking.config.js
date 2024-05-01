export const linking = {
  prefixes: ['splitsies://'],
  config: {
    screens: {
      RootScreen: {                
        screens: {
          Home: {
            screens: {
              Requests: "requests/:expenseId"
            }
          }
        }
      }
    },
  },
};