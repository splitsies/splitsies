This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

## Step 0: Dependencies and Excluded Configurations

See `docs/ad-setup.md` for including the configured ad ID to your local environment before starting up.

```
npm install --include=dev
```

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android
```

### For iOS

```bash
# using npm
npm run ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

### Running for different environments

Different API endpoints are used based on the run environment. To run the application on your desired environment:

```bash
npm run ios:<ENV>

# or

npm run android:<ENV>
```

Alternatively, you can select a scheme and device to run on from Xcode.

See the `package.json` scripts for available environments.

