---
url: "https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa"
title: "Publishing a Progressive Web App (PWA) | Solana Mobile Docs"
---

[Skip to main content](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#__docusaurus_skipToContent_fallback)

On this page

## PWAs on the dApp Store [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#pwas-on-the-dapp-store "Direct link to PWAs on the dApp Store")

[Progressive Web Apps (PWAs)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) are web applications that use modern web capabilities to deliver an app-like experience to users.

PWAs can be published on the dApp Store, as an Android app wrapped within a **Trusted Web Activity (TWA)**.

## Trusted Web Activities (TWAs) [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#trusted-web-activities-twas "Direct link to Trusted Web Activities (TWAs)")

[Trusted Web Activities (TWAs)](https://developer.chrome.com/docs/android/trusted-web-activity) allow you to package your PWA into an Android app. TWAs use Chrome to render the web app, providing a full screen, native-like experience without any browser UI.

Once you create a TWA, you will have an Android APK file and you can follow the dApp publishing guide to submit the app.

Follow the guide below to get your PWA ready for the dApp Store.

## Tutorial: Converting a PWA to an Android App [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#tutorial-converting-a-pwa-to-an-android-app "Direct link to Tutorial: Converting a PWA to an Android App")

This guide shows you how to:

- Install the Bubblewrap CLI tool
- Build the TWA and output an APK
- Generate the Digital Asset Link for the APK

By the end, you will have a functional, signed release APK that can be published on the dApp Store!

### Prequisites [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#prequisites "Direct link to Prequisites")

- A functional, hosted PWA with a [web manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

If missing an existing web manifest, you can follow this [resource](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests) to create one for your website.

### 1\. Installing Bubblewrap CLI [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#1-installing-bubblewrap-cli "Direct link to 1. Installing Bubblewrap CLI")

[Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap/tree/main/packages/cli) is a tool that simplifies the process of converting your PWA into an Android app using TWA.

Requires Node 14.15.0 and above

```codeBlockLines_e6Vv
npm i -g @bubblewrap/cli

```

### 2\. Initializing Your Project [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#2-initializing-your-project "Direct link to 2. Initializing Your Project")

In a new directory, run the `init` command and supply the URL to your web manifest.
Bubblewrap will download the existing manifest and use it to help fill in metadata for the TWA's manifest.

- See the Bubblewrap official [documentation](https://github.com/GoogleChromeLabs/bubblewrap/tree/main/packages/cli#init).

```codeBlockLines_e6Vv
bubblewrap init --manifest https://your-pwa-url.com/manifest.json

```

This command will guide you through the process of creating the TWA manifest for the project.

- If it asks to install additional tooling (e.g Android SDK, JDK, or build tools), it is necessary and you should allow it to install.

#### Manifest Configuration [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#manifest-configuration "Direct link to Manifest Configuration")

It will also prompt a series of questions regarding configurations for:

- **Domain and URL path**
  - Ensure this points directly to where your PWA is hosted.
- **Display mode and Status Bar settings**
  - See the [Android documentation](https://material.io/design/platform-guidance/android-bars.html) to see how Status Bar and Navigation Bars appear and decide what configuration is appropriate for your app.
- **Splash Screen and Icons**
  - Create a cohesive splash screen by providing a splash screen color and an icon that displays over it.
- **Keystore location and Password**
  - See _Caution_ below.

caution

The `init` command will ask you to generate an **Android Keystore and password**.

The [Android Keystore](https://developer.android.com/privacy-and-security/keystore) is a security tool that:

- Contains a private key used to digitally sign your app. This signature is used to verify the app's authenticity and integrity.
- The same key must be used to sign all future updates of your app. This ensures that only you can make updates to your app.

Keep the Keystore file and password secure – losing them can prevent future app updates. Consider following
Google's [official guide for best practices around Keystore management](https://developer.android.com/studio/publish/app-signing#secure_key).

After completion, Bubblewrap will create in your directory:

- A `twa-manifest.json` configured with the options from above.
- TWA Android project files generated from `twa-manifest.json`.

note

The Android project is entirely generated from the `twa-manifest.json`, so you only need to include
`twa-manifest.json` in source control. The Android project files are unncessary to track as they are generated.

Any changes to the Android project will be deleted or overwritten by the `update` command (explained in the _Updating your TWA_ section).

### 3\. Building the Android APK [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#3-building-the-android-apk "Direct link to 3. Building the Android APK")

#### Add supported langauges [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#add-supported-langauges "Direct link to Add supported langauges")

Before running the build command, you need to specify the languages your app supports.

warning

Do not skip this step!

By default, Bubblewrap CLI incorrectly declares that your app supports all locales. This inaccuracy will be displayed on your dApp Store listing page.

In the generated Android project, edit the `build.gradle` and add:

```codeBlockLines_e6Vv
android {
    defaultConfig {
        ...
        resConfigs "en", "es" // Add any locales your app supports
    }
}

```

See the [Android documentation](https://developer.android.com/guide/topics/resources/multilingual-support#specify-the-languages-your-app-supports) for more details.

#### Build the APK [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#build-the-apk "Direct link to Build the APK")

The next step is to build initialized Android project and output a _signed release APK_. This APK is what you will submit for publishing on the dApp Store.

In the same directory, run:

```codeBlockLines_e6Vv
bubblewrap build

```

This command will

- If it asks to install additional tooling (e.g Android SDK, JDK, or build tools), you should allow it to install.

### 4\. Publish Digital Asset Links [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#4-publish-digital-asset-links "Direct link to 4. Publish Digital Asset Links")

The last step is to declare your app's [Digital Asset Links (DAL)](https://developers.google.com/digital-asset-links/v1/getting-started). DALs establish a secure connection between your website and the Android app.

tip

This step is **required** for the PWA to display in a full screen, native-like experience. If missing, the PWA will display
Chrome browser UI (e.g the URL bar).

Declare the connection by adding the SHA256 fingerprints of your app’s signing certificate at `https://your-domain.com/.well-known/assetlinks.json`.

1. Generate the SHA256 fingerprint from the Keystore:

```codeBlockLines_e6Vv
keytool -list -v -keystore android.keystore

```

2. Add the fingerprint to your TWA manifest:

```codeBlockLines_e6Vv
bubblewrap fingerprint add <SHA256_fingerprint>

```

3. Generate the DAL `assetlinks.json` file:

```codeBlockLines_e6Vv
bubblewrap fingerprint generateAssetLinks

```

It should generate a file named `assetlinks.json` configured with the SHA256 fingerprint.

4. Publish the generated `assetlinks.json` file at:
`https://your-domain.com/.well-known/assetlinks.json`

Congrats! You have successfully converted your PWA into a working Android app.

## Testing Your App [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#testing-your-app "Direct link to Testing Your App")

If you have an emulator or testing device ready, you can install the APK with:

```codeBlockLines_e6Vv
bubblewrap install app-release-signed.apk

```

Ensure the app is working as expected before submitting to the dApp Store.

tip

If you are seeing the browser navigation bar at the top of the app, your app's Digital Asset Links might not be configured
correctly.

Double check that you followed Step 4 and have correctly published your app's SHA256 fingerprint.

## Updating your TWA [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#updating-your-twa "Direct link to Updating your TWA")

If you want to release a new version of the app with changes to the TWA manifest (e.g Updating the icon), you can
make edits to `twa-manifest.json` and run the command:

```codeBlockLines_e6Vv
bubblewrap update --manifest=./path/to/twa-manifest.json

```

This command regenerates the entire Android project from the `twa-manifest.json` and bumps the app version. The manifest is preserved, while any manual changes to the previous Android project are deleted or overwritten.

After this you can run `bubblewrap build` again to generate the signed release APK.

## Publishing to dApp Store [​](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa\#publishing-to-dapp-store "Direct link to Publishing to dApp Store")

Once you have a signed APK, you can proceed with publishing as if you were publishing a normal
Android app.

**Follow the step by step [dApp publishing guide](https://docs.solanamobile.com/dapp-publishing/overview) to submit your signed release APK.**

- [PWAs on the dApp Store](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#pwas-on-the-dapp-store)
- [Trusted Web Activities (TWAs)](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#trusted-web-activities-twas)
- [Tutorial: Converting a PWA to an Android App](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#tutorial-converting-a-pwa-to-an-android-app)
  - [Prequisites](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#prequisites)
  - [1\. Installing Bubblewrap CLI](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#1-installing-bubblewrap-cli)
  - [2\. Initializing Your Project](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#2-initializing-your-project)
  - [3\. Building the Android APK](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#3-building-the-android-apk)
  - [4\. Publish Digital Asset Links](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#4-publish-digital-asset-links)
- [Testing Your App](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#testing-your-app)
- [Updating your TWA](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#updating-your-twa)
- [Publishing to dApp Store](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa#publishing-to-dapp-store)