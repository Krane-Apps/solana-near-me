---
url: "https://docs.solanamobile.com/android-native/quickstart"
title: "Kotlin Quickstart | Solana Mobile Docs"
---

[Skip to main content](https://docs.solanamobile.com/android-native/quickstart#__docusaurus_skipToContent_fallback)

On this page

The quickest way to start building Solana Kotlin dApps is to build off the [Solana Jetpack Compose Scaffold](https://github.com/solana-mobile/solana-kotlin-compose-scaffold).

## Solana Jetpack Compose Scaffold [​](https://docs.solanamobile.com/android-native/quickstart\#solana-jetpack-compose-scaffold "Direct link to Solana Jetpack Compose Scaffold")

The scaffold app serves as both a starting implementation and an example reference of how to use the core Kotlin SDKs, like `web3-core`, `rpc-core`,
and Mobile Wallet Adapter.

It includes:

- Core Solana kotlin libraries
- Pre-built Compose UI components,
- Code examples of transaction building and RPC requests.

![Scaffold dApp Screenshot 1](https://docs.solanamobile.com/kotlin_images/scaffoldScreenshot1.png)

![Scaffold dApp Screenshot 2](https://docs.solanamobile.com/kotlin_images/scaffoldScreenshot2.png)

![Scaffold dApp Screenshot 3](https://docs.solanamobile.com/kotlin_images/scaffoldScreenshot3.png)

## Prerequisites [​](https://docs.solanamobile.com/android-native/quickstart\#prerequisites "Direct link to Prerequisites")

Follow the [prerequisite setup](https://docs.solanamobile.com/developers/development-setup#prerequisite-setup) guide to set up Android Studio, your [Android Device/Emulator](https://docs.solanamobile.com/developers/development-setup#2-setup-deviceemulator) and install a MWA-compatible wallet, like [fakewallet](https://docs.solanamobile.com/developers/development-setup#3-install-a-wallet-app).

## Install the Jetpack Compose Scaffold [​](https://docs.solanamobile.com/android-native/quickstart\#install-the-jetpack-compose-scaffold "Direct link to Install the Jetpack Compose Scaffold")

**Clone the repo**

The scaffold app is open source and can be fetched from [Github](https://github.com/solana-mobile/solana-kotlin-compose-scaffold).

```codeBlockLines_e6Vv
git clone https://github.com/solana-mobile/solana-kotlin-compose-scaffold.git

```

**Open the project in Android Studio**

In Android Studio, open the project with `File > Open > SolanaKotlinComposeScaffold/build.gradle.kts`

**Build and run**

Ensure you have connected an Android emulator or device and it is detected by Android Studio. If not, follow
this [guide](https://docs.solanamobile.com/developers/development-setup#2-setup-deviceemulator) to setup your emulator/device.

In the top bar of Android Studio, select `"app"` as the configuration and your emulator/device, then click run.

![Build and run the app](https://docs.solanamobile.com/assets/images/compose-build-run-953a48b83f21f65098b34cb964f6e008.png)

If successful, the scaffold app will launch on your emulator/device.

Connect with a locally installed wallet app to start interacting with the Solana network! 🎉

## Further learning [​](https://docs.solanamobile.com/android-native/quickstart\#further-learning "Direct link to Further learning")

To learn how to better use the core Solana Kotlin SDKs, check out these developer guides.

[🌐\\
\\
**JSON RPC Requests**\\
\\
Learn the rpc-core library to create and send Solana RPC Requests.](https://docs.solanamobile.com/android-native/rpc-requests)

[🔧\\
\\
**Transaction building**\\
\\
Use the web3-core library to construct Solana transactions and Program instructions.](https://docs.solanamobile.com/android-native/building_transactions)

[📱\\
\\
**Mobile Wallet Adapter**\\
\\
Learn how to connect to mobile wallets and request signing services.](https://docs.solanamobile.com/android-native/using_mobile_wallet_adapter)

- [Solana Jetpack Compose Scaffold](https://docs.solanamobile.com/android-native/quickstart#solana-jetpack-compose-scaffold)
- [Prerequisites](https://docs.solanamobile.com/android-native/quickstart#prerequisites)
- [Install the Jetpack Compose Scaffold](https://docs.solanamobile.com/android-native/quickstart#install-the-jetpack-compose-scaffold)
- [Further learning](https://docs.solanamobile.com/android-native/quickstart#further-learning)