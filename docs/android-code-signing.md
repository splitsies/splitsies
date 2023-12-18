# Android Code Signing

## Background
From official React Native docs
> Android requires that all apps be digitally signed with a certificate before they can be installed. In order to distribute your Android application via Google Play store it needs to be signed with a release key that then needs to be used for all future updates. Since 2017 it is possible for Google Play to manage signing releases automatically thanks to App Signing by Google Play functionality. However, before your application binary is uploaded to Google Play it needs to be signed with an upload key. The Signing Your Applications page on Android Developers documentation describes the topic in detail. This guide covers the process in brief, as well as lists the steps required to package the JavaScript bundle.


## Setup

1. Grab the `com.kchen.Splitsies.keystore` file and drop it into the `android/app/` folder


2. The keystore requires a password, which is defined outside the repository for security reasons. Follow the instructions in <href>https://reactnative.dev/docs/signed-apk-android#setting-up-gradle-variables</href> for the `~/.gradle/gradle.properties` with the following content:
```
SPLITSIES_UPLOAD_STORE_FILE=com.kchen.Splitsies.keystore
SPLITSIES_UPLOAD_KEY_ALIAS=splitsies-play-store-key
SPLITSIES_UPLOAD_STORE_PASSWORD=********
SPLITSIES_UPLOAD_KEY_PASSWORD=********
```