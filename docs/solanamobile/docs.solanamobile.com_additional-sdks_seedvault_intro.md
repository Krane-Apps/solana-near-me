---
url: "https://docs.solanamobile.com/additional-sdks/seedvault_intro"
title: "Seed Vault SDK | Solana Mobile Docs"
---

[Skip to main content](https://docs.solanamobile.com/additional-sdks/seedvault_intro#__docusaurus_skipToContent_fallback)

On this page

### [Seed Vault](https://github.com/solana-mobile/seed-vault-sdk) [​](https://docs.solanamobile.com/additional-sdks/seedvault_intro\#seed-vault "Direct link to seed-vault")

The Seed Vault is a system service providing secure key custody to Wallet apps. By integrating with secure execution environments available on mobile devices (such as secure operating modes of the processor and/or secure auxiliary coprocessors), Seed Vault helps to keep your secrets safe, by moving them to the highest privileged environment available on the device. Your keys, seeds, and secrets never leave the secure execution environment, while UI components built into Android handle interaction with the user to provide a secure transaction signing experience to users.

For Wallet apps, this SDK provides an API contract and support library for accessing the Seed Vault. It also includes a Seed Vault simulator, which can be installed on devices running Android 12.

Important note: this Seed Vault simulator does not provide secure transaction signing, and should not be used for any purposes other than development and testing of Wallet apps.

- [Seed Vault](https://docs.solanamobile.com/additional-sdks/seedvault_intro#seed-vault)