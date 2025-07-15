---
url: "https://docs.solanamobile.com/dapp-publishing/link-to-dapp-listing-page"
title: "Linking to your dApp listing page | Solana Mobile Docs"
---

[Skip to main content](https://docs.solanamobile.com/dapp-publishing/link-to-dapp-listing-page#__docusaurus_skipToContent_fallback)

On this page

The dApp Store provides a deep-linking scheme that you can use to directly link users to your app's listing page, where users can see the description, preview media, and more, and then install the app.

## Deep-link scheme [​](https://docs.solanamobile.com/dapp-publishing/link-to-dapp-listing-page\#deep-link-scheme "Direct link to Deep-link scheme")

To create the link, you need to know the app's fully qualified _package name_, which is declared in the app's manifest file (e.g `com.solanamobile.mintyfresh`). For Expo apps, it can be found in the `android` field of your `app.json`.

```codeBlockLines_e6Vv
solanadappstore://details?id=<package_name>

```

An example:

```codeBlockLines_e6Vv
solanadappstore://details?id=com.solanamobile.mintyfresh

```

## Linking from an Android app [​](https://docs.solanamobile.com/dapp-publishing/link-to-dapp-listing-page\#linking-from-an-android-app "Direct link to Linking from an Android app")

You can also link to your dApp Store listing page from an Android app.

This can be useful, for example, when your user's app is out-of-date and you want to link them to the listing page to update the app.

- React Native
- Kotlin

```codeBlockLines_e6Vv
import { Linking } from "react-native";

// Use the React Native `Linking` library to open the URL
const linkToListing = () => {
  const url = "solanadappstore://details?id=com.solanamobile.mintyfresh";
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error("Unable to link to dApp Store");
      }
    })
    .catch((err) => console.error("An error occurred", err));
};

```

- [Deep-link scheme](https://docs.solanamobile.com/dapp-publishing/link-to-dapp-listing-page#deep-link-scheme)
- [Linking from an Android app](https://docs.solanamobile.com/dapp-publishing/link-to-dapp-listing-page#linking-from-an-android-app)