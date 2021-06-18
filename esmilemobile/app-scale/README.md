# AppScale
This app sends weight measurements to the Foodwaste front-end from a supported scale or hardware.

HS-testing

## Development setup

### Prerequisites
* Node.js 12 LTS - https://nodejs.org/en/
* npm - https://www.npmjs.com/get-npm
* Android SDK - https://developer.android.com/studio
* Android SDK Platform 29 (API 10)

### Installation
Install dependencies

```bash
npm install
```

### Start
Start the packager.

```bash
npm start 
```

Then build the app for Android, while having a Android device connected to your computer. The device must have connection to the VPN, in order to access the FoodWaste frontend on the develop environment ( http://app.dev.esmiley.com )


```bash
npm run android                   
```

## Linting

Auto fix fixable lint issues with `npm run lint -- --fix`

## Built with
React Native
TypeScript

### Debug with local web client / remote inspect
1. run web client using --host 0.0.0.0 flag to make it accessible within the network
2. add <application ... android:usesCleartextTraffic="true"> to AndroidManifest (Required with >= Android 9.0 (API level 28))
3. change src/config.tsx ESMILEY_FW_APP_URI to match your local machine's IP
4. open chrome on your local machine, and find the android device via chrome://inspect

### Debug through WIFI

1. Plug in your device through USB
2. *adb tcpip <port>* e.g.: `adb tcpip 5555` 
3. Get device-ip (from device or `adb shell ip addr show wlan0`)
4. *adb connect <device-ip>:<port>* e.g.: `adb connect 192.168.44.121:5555`

For hot reloading:
1. Shake the phone > Dev Settings > Debug server host & port
2. Fill out the packager server address, e.g.: `192.168.44.122:8081`

### Change app icon

`https://medium.com/bam-tech/generate-your-react-native-app-icons-in-a-single-command-line-145af2e329b2`

1. `npm install -g yo generator-rn-toolbox`
2. yo rn-toolbox:assets --icon _path to your icon_

### Generating the APK file for release
You can generate the APK file in two ways: 

#### Automatically generate it via Bamboo
When you merge a release branch into the `master` branch, a build will be triggered in Bamboo (**AppScale - Release**), which will ultimately run the `release-build` script that generates and signs the APK file.

The file will be found as an artifact and can be downloaded, to be further imported into Google Play.


#### Manually generate it locally
When releasing the android app we need to generate a signed `.apk`.
The keystore is located at: `/android/app/android_app.keystore` .

Before you start, make sure you add the following global variables to your `~/.gradle/gradle.properties`:

```
ESMILEY_STORE_FILE=android_app.keystore
ESMILEY_KEY_ALIAS=android_signing
ESMILEY_STORE_PASSWORD=_keystore password_
ESMILEY_KEY_PASSWORD=_key/alias password_
```

1. `npm run release-build` <br>
(This is an alternative to the previously used `assemble-android-release`, mostly in the fact that it includes a fix to a "Duplicate resources" error found in later React Native versions. You can find an issue page here: https://github.com/facebook/react-native/issues/26245)

2. The release APK is now located at: `/android/app/build/outputs/apk/release/app-release.apk`

#### Change config variables

The config variables are located in: `src/config.tsx`.

To change the variables AFTER the APK was generated:
1. Unpack the artifact (`.apk` file)
2. Replace variables in `assets/index.android.bundle`


### MyWeight scales
We need to set the scale to *SCI.3* mode, like so:

1. Press down and hold the “M” key until the indicator displays “SCI.x” (E.g: SCI.1)
2. Press the “M” or “D” key to change the x value, the display will flash the “x” value when
it is changed, press the “T” key for confirmation, the “x” will then stop flashing
3. Press the "O" (on/off) key to exit and save


### Troubleshooting Debug
Error: `Package signatures do not match the previously installed version; ignoring`
* run `adb uninstall "com.esmiley.app.scale"`

Error: `None of these files exist: * debugger-ui/debuggerWorker`
* make sure you have correct node (12 LTS) version, try clearing cache `npm run start -- --reset-cache`
* try removing node modules and reinstalling the node modules

Not able to connect to device via WIFI
* open debug menu on device `adb shell input keyevent 82`
* select settings > enter debug server ip address (your host ip) and port (default 8081)
* try connecting to device again via wifi
