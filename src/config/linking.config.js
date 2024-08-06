export const linking = {
  prefixes: ['splitsies://'],
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
    prefixes: ['splitsies://'],
    config: {
        screens: {
            LoginScreen: "*"
        }
    }
};