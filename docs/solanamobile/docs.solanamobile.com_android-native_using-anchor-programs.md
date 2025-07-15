---
url: "https://docs.solanamobile.com/android-native/using-anchor-programs"
title: "Working with Anchor Programs in Kotlin | Solana Mobile Docs"
---

[Skip to main content](https://docs.solanamobile.com/android-native/using-anchor-programs#__docusaurus_skipToContent_fallback)

On this page

[Anchor](https://www.anchor-lang.com/) is a popular Solana development framework for writing on-chain programs. Programs and instructions created with Anchor, have a different data format than other programs like SPL and SystemProgram.

This guide will teach you how to build instructions and transactions that invoke Anchor programs in Kotlin.

## Add dependencies [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#add-dependencies "Direct link to Add dependencies")

Add the following dependencies to your project:

- [`web3-solana`](https://github.com/solana-mobile/web3-core) library provides the abstraction classes like `Transaction` and `AccountMeta` to simplify building Solana transactions.
- [`rpc-core`](https://github.com/solana-mobile/rpc-core) library provides a `SolanaRpcClient` class with convenient RPC methods.
- [`kborsh`](https://github.com/Funkatronics/kBorsh/tree/main) library for Borsh serialization of instruction data.

- build.gradle.kts

```
dependencies {
  implementation("com.solanamobile:web3-solana:0.2.5")
  implementation("com.solanamobile:rpc-core:0.2.7")
  implementation('io.github.funkatronics:kborsh:0.1.0')
}
```

## Example: Counter Program [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#example-counter-program "Direct link to Example: Counter Program")

As an example, we'll build a transaction using this devnet on-chain [Counter Program](https://github.com/solana-mobile/tutorial-apps/blob/main/AnchorCounterDapp/counter-program/programs/counter-program/src/lib.rs) that was created with Anchor.

Specifically, let's invoke the `Increment` instruction.

### Instruction Format [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#instruction-format "Direct link to Instruction Format")

Taking a look at the [source code](https://github.com/solana-mobile/tutorial-apps/blob/main/AnchorCounterDapp/counter-program/programs/counter-program/src/lib.rs#L43), observe that the `Increment` instruction format expects:

**Program ID**

- The Counter Program is deployed on devnet with the Program Id: `ADraQ2ENAbVoVZhvH5SPxWPsF2hH5YmFcgx61TafHuwu`.

**Account Addresses**

- The Counter account PDA as a non-signer. `"counter"` is the only seed used to derive the PDA.

**Instruction Data**

- An `amount: u64` parameter.
- An additional 8 bytes for the [Anchor discriminator](https://book.anchor-lang.com/anchor_bts/discriminator.html)

Now, let's create each of these required inputs.

### 1\. Find the Counter account PDA [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#1-find-the-counter-account-pda "Direct link to 1. Find the Counter account PDA")

To derive the Counter PDA, we'll use the `ProgramDerivedAddres` interface in the `web3-solana` module which provides a `find` method.

Call `ProgramDerivedAddres.find` and pass `"counter"` as a seed and the Counter program ID:

```codeBlockLines_e6Vv
import com.solana.publickey.SolanaPublicKey
import com.solana.publickey.ProgramDerivedAddress

val programId = SolanaPublicKey.from("ADraQ2ENAbVoVZhvH5SPxWPsF2hH5YmFcgx61TafHuwu")

// Counter account has a single seed 'counter'
val seeds = listOf("counter".encodeToByteArray())

// Calculate the PDA
val result = ProgramDerivedAddress.find(seeds, programId)

// Unwrap the result
val counterAccountPDA = result.getOrNull()

```

### 2\. Serialize the instruction data [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#2-serialize-the-instruction-data "Direct link to 2. Serialize the instruction data")

The next step is to build and serialize the instruction data.

Using the `kotlinx` serialization library, define the expected increment arguments as a `@Serializable` class.

```codeBlockLines_e6Vv
import kotlinx.serialization.Serializable

@Serializable
class Args_increment(val amount: UInt)

```

Now, use the `AnchorInstructionSerializer` to serialize the instruction arguments and lastly use the `kBorsh` library to Borsh encode the data.

```codeBlockLines_e6Vv
val encodedInstructionData = Borsh.encodeToByteArray(
    AnchorInstructionSerializer("increment"),
    Args_increment(amount)
)

```

info

Anchor instruction data uses a unique [Anchor discriminator](https://book.anchor-lang.com/anchor_bts/discriminator.html) to determine which instruction is called.

The `AnchorInstructionSerializer` will handle this discriminator during serialization, as long as you pass the correct instruction name (e.g `increment`) into the constructor.

### 3\. Construct the instruction [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#3-construct-the-instruction "Direct link to 3. Construct the instruction")

Putting all the inputs together, you can build the full `TransactionInstruction`.

```codeBlockLines_e6Vv
import com.solana.publickey.SolanaPublicKey
import com.solana.transaction.*

val incrementInstruction = TransactionInstruction(
    SolanaPublicKey.from("ADraQ2ENAbVoVZhvH5SPxWPsF2hH5YmFcgx61TafHuwu"),
    listOf(AccountMeta(counterAccountPDA!!, false, true)),
    encodedInstructionData
)

```

### 4\. Create the transaction [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#4-create-the-transaction "Direct link to 4. Create the transaction")

Then build a transaction message and construct the `Transaction` packed with the increment instruction.

```codeBlockLines_e6Vv
import com.solana.transaction.*
import com.solana.rpc.SolanaRpcClient
import com.solana.networking.KtorNetworkDriver

// Fetch latest blockhash from RPC
val rpcClient = SolanaRpcClient("https://api.devnet.solana.com", KtorNetworkDriver())
val blockhashResponse = rpcClient.getLatestBlockhash()

// Build transaction message
val incrementAmount = 5
val incrementCounterMessage =
    Message.Builder()
        .addInstruction(
            incrementInstruction
        )
        .setRecentBlockhash(blockhashResponse.result!!.blockhash)
        .build()

// Construct the Transaction object from the message
val unsignedIncrementTx = Transaction(incrementCounterMessage)

```

### 5\. Sign the transaction [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#5-sign-the-transaction "Direct link to 5. Sign the transaction")

At this point, you have successfully created an _unsigned_ Solana transaction for incrementing the counter account. Before submitting to the network, the transaction must be signed by the fee payer.

#### Signing with Mobile Wallet Adapter [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#signing-with-mobile-wallet-adapter "Direct link to Signing with Mobile Wallet Adapter")

If you want users to sign the transaction using their mobile wallet app (e.g Phantom, Solflare) you can use Mobile Wallet Adapter to request signing.

Read the [_Using Mobile Wallet Adapter_ guide](https://docs.solanamobile.com/android-native/using_mobile_wallet_adapter#signing-and-sending-transactions) to learn how to prompt users to sign these transactions and submit them to the Solana network.

#### Signing with a keypair [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#signing-with-a-keypair "Direct link to Signing with a keypair")

If you have direct access to a keypair, you can serialize the Transaction message, sign the bytes, and construct the signed transaction.

```codeBlockLines_e6Vv
import com.solana.transaction.*
import com.solana.rpc.SolanaRpcClient
import com.solana.networking.KtorNetworkDriver

// Fetch latest blockhash from RPC
val rpcClient = SolanaRpcClient("https://api.devnet.solana.com", KtorNetworkDriver())
val blockhashResponse = rpcClient.getLatestBlockhash()

// Build transaction message
val incrementAmount = 5
val incrementCounterMessage =
    Message.Builder()
        .addInstruction(
            incrementInstruction
        )
        .setRecentBlockhash(blockhashResponse.result!!.blockhash)
        .build()

// Sign the transaction with some keypair signer
val signature = ed25519Signer.signBytes(incrementCounterMessage.serialize())

// Signed transaction ready to be submitted to the network
val signedTransaction = Transaction(listOf(signature), incrementCounterMessage)

```

### 6\. Sending the transaction [​](https://docs.solanamobile.com/android-native/using-anchor-programs\#6-sending-the-transaction "Direct link to 6. Sending the transaction")

After the transaction is signed, it can be submitted to an RPC using the `SolanaRpcClient` class.

```codeBlockLines_e6Vv
import com.solana.rpc.SolanaRpcClient
import com.solana.networking.KtorNetworkDriver

val rpcClient = SolanaRpcClient("https://api.devnet.solana.com", KtorNetworkDriver())

val response = rpcClient.sendTransaction(signedTransaction)

if (response.result) {
    println("Transaction signature: ${response.result}")
} else if (response.error) {
    println("Failed to send transaction: ${response.error.message}")
}

```

- [Add dependencies](https://docs.solanamobile.com/android-native/using-anchor-programs#add-dependencies)
- [Example: Counter Program](https://docs.solanamobile.com/android-native/using-anchor-programs#example-counter-program)
  - [Instruction Format](https://docs.solanamobile.com/android-native/using-anchor-programs#instruction-format)
  - [1\. Find the Counter account PDA](https://docs.solanamobile.com/android-native/using-anchor-programs#1-find-the-counter-account-pda)
  - [2\. Serialize the instruction data](https://docs.solanamobile.com/android-native/using-anchor-programs#2-serialize-the-instruction-data)
  - [3\. Construct the instruction](https://docs.solanamobile.com/android-native/using-anchor-programs#3-construct-the-instruction)
  - [4\. Create the transaction](https://docs.solanamobile.com/android-native/using-anchor-programs#4-create-the-transaction)
  - [5\. Sign the transaction](https://docs.solanamobile.com/android-native/using-anchor-programs#5-sign-the-transaction)
  - [6\. Sending the transaction](https://docs.solanamobile.com/android-native/using-anchor-programs#6-sending-the-transaction)