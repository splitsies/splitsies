# Adding New Environments

## Background
Splitsies is using `react-native-config` to set handle injecting environment variables into app builds. The actual environment variable configuration is minimal - just the STAGE parameter indicating which environment the app is configured in. 

It is each configuration model's responsibility to inflate itself with the appropriate configuration json based on this STAGE parameter. See `ApiConfig` as an example.

## Setup

1. Add a new `./src/.env/.env.<NEW_ENVIRONMENT_NAME>` file with:
```
STAGE=<NEW_ENVIRONMENT_NAME>`
```

### Android
1. Add a product flavor to `android/app/build.gradle`
```
...
productFlavors {
    ...
    newEnvironmentName {
        dimension "environment"
        versionNameSuffix "-envSpecificSuffix"
    }
}
...
```
2. At the end of the same file, map the `.env.<NEW_ENVIRONMENT_NAME>` by adding a new entry
```
project.ext.envConfigFiles = [
    ...
    <NEW_ENVIRONMENT_NAME>: ./src/.env/.env.<NEW_ENVIRONMENT_NAME>
]
```
3. Sync Gradle
4. Add an entry to the `package.json` scripts to run this new environment
5. If running from Android Studio, Go to Build > Select Build Variants and select the new Active Build Variant for Module :app. Then you should be able to run the application in that environment from Android Studio.

### iOS
1. Duplicate an environment Scheme by clicking the current scheme and Edit Scheme > Duplicate Scheme
2. Rename the Scheme appropriately and make sure to check Shared at the bottom if this is meant to be committed to git
3. Edit the newly created Scheme and update the Pre-Build script to reference the new environment config
```
rm -f "${PROJECT_DIR}/../node_modules/react-native-config/ios/ReactNativeConfig/GeneratedDotEnv.m"
cp "${PROJECT_DIR}/../src/.env/.env.<NEW_ENVIRONMENT_NAME>" "${PROJECT_DIR}/../.env"
```

Note: The first command ensures that the environment variable is actually consumed in the new build upon switching schemes