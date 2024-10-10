export const linking = {
  prefixes: ['splitsies://', 'https://splitsiesapp.com'],
  config: {
    screens: {
      RootScreen: {                
        screens: {
          Home: {
            screens: {
                Requests: "requests/:expenseId",
                Feed: "expenses/:expenseId/:requestingUserId"
            }
          }
        }
      }
    },
  },
};

export const unauthenticatedLinking = {
    prefixes: ['splitsies://', 'https://splitsiesapp.com'],
    config: {
        screens: {
            LoginScreen: "*"
        }
    }
};