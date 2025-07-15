---
url: "https://docs.solanamobile.com/android-native/setup"
title: "Kotlin Project Setup | Solana Mobile Docs"
---

[Skip to main content](https://docs.solanamobile.com/android-native/setup#__docusaurus_skipToContent_fallback)

On this page

### Prerequisites [​](https://docs.solanamobile.com/android-native/setup\#prerequisites "Direct link to Prerequisites")

- Download [Android Studio](https://developer.android.com/studio) for development and device management.

- Follow the [prerequisite setup](https://docs.solanamobile.com/developers/development-setup#prerequisite-setup) guide to set up your [Android Device/Emulator](https://docs.solanamobile.com/developers/development-setup#2-setup-deviceemulator) and install a MWA-compatible wallet, like [fakewallet](https://docs.solanamobile.com/developers/development-setup#3-install-a-wallet-app).


## Solana Mobile Kotlin Compose Scaffold [​](https://docs.solanamobile.com/android-native/setup\#solana-mobile-kotlin-compose-scaffold "Direct link to Solana Mobile Kotlin Compose Scaffold")

The quickest way to start developing on Kotlin is to build off of the [Solana Jetpack Compose Scaffold](https://github.com/solana-mobile/solana-kotlin-compose-scaffold) example.

The scaffold is a basic Solana Android app built with [Jetpack Compose](https://developer.android.com/jetpack/compose) and Material 3 components.

Follow the quickstart guide to install and run the scaffold app.

[Quickstart](https://docs.solanamobile.com/android-native/quickstart)

## Android Project Setup [​](https://docs.solanamobile.com/android-native/setup\#android-project-setup "Direct link to Android Project Setup")

### Setting up a fresh Android Project [​](https://docs.solanamobile.com/android-native/setup\#setting-up-a-fresh-android-project "Direct link to Setting up a fresh Android Project")

Follow these steps to setup a fresh Android project with the recommended libraries for Solana development.

#### Step 1: Navigate to your Android project's build.gradle file [​](https://docs.solanamobile.com/android-native/setup\#step-1-navigate-to-your-android-projects-buildgradle-file "Direct link to Step 1: Navigate to your Android project's build.gradle file")

In Android Studio, navigate to your Android project's module `build.gradle.kts` file.

#### Step 2. Add Solana dependencies [​](https://docs.solanamobile.com/android-native/setup\#step-2-add-solana-dependencies "Direct link to Step 2. Add Solana dependencies")

Include the following dependencies to your Android project's `build.gradle.kts` file. These
are the recommended core Kotlin libraries for Solana transaction building, RPC requests, and wallet signing.

- build.gradle.kts

```
dependencies {
  implementation("com.solanamobile:mobile-wallet-adapter-clientlib-ktx:2.0.3")
  implementation("com.solanamobile:web3-solana:0.2.5")
  implementation("com.solanamobile:rpc-core:0.2.7")
  implementation("io.github.funkatronics:multimult:0.2.3")
}
```

Overview of each dependency:

- `com.solanamobile:mobile-wallet-adapter-clientlib-ktx`: Mobile Wallet Adapter client library for interacting with MWA-compatible wallets.
- `com.solanamobile:web3-solana`: Solana Kotlin library providing core Solana primitives like transaction building and public key class.
- `com.solanamobile:rpc-core`: A Kotlin library providing a generic interface and abstractions for building Solana RPC requests.
- `io.github.funkatronics:multimult`: Lightweight utility library for Base58 conversions.

#### Step 3. Build and run your app [​](https://docs.solanamobile.com/android-native/setup\#step-3-build-and-run-your-app "Direct link to Step 3. Build and run your app")

Your project's dependencies should be set up and you can try building and run the app!

## Next Steps [​](https://docs.solanamobile.com/android-native/setup\#next-steps "Direct link to Next Steps")

Congrats! At this point, you have installed the necessary libraries for your project and are ready to start building an app that interacts with the Solana network.

Check out the other resources on this site like guides, SDK references, and sample apps to learn more about what you can do.

- [Prerequisites](https://docs.solanamobile.com/android-native/setup#prerequisites)
- [Solana Mobile Kotlin Compose Scaffold](https://docs.solanamobile.com/android-native/setup#solana-mobile-kotlin-compose-scaffold)
- [Android Project Setup](https://docs.solanamobile.com/android-native/setup#android-project-setup)
  - [Setting up a fresh Android Project](https://docs.solanamobile.com/android-native/setup#setting-up-a-fresh-android-project)
- [Next Steps](https://docs.solanamobile.com/android-native/setup#next-steps)