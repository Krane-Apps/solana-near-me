---
url: "https://docs.solanamobile.com/android-native/building_transactions"
title: "Building Solana transactions | Solana Mobile Docs"
---

[Skip to main content](https://docs.solanamobile.com/android-native/building_transactions#__docusaurus_skipToContent_fallback)

On this page

A client interacts with the Solana network by submitting a _transaction_ to the cluster. Transactions
allow a client to invoke instructions of on-chain [_Programs_](https://docs.solana.com/developing/intro/programs).

For a full explanation, see the core docs overview of a [_transaction_](https://docs.solana.com/developing/programming-model/transactions).

## Add dependencies [​](https://docs.solanamobile.com/android-native/building_transactions\#add-dependencies "Direct link to Add dependencies")

The [`web3-solana`](https://github.com/solana-mobile/web3-core) library provides the abstraction classes like `Transaction` and `AccountMeta` to simplify building Solana transactions.

- build.gradle.kts

```
dependencies {
  implementation("com.solanamobile:web3-solana:0.2.5")
}
```

## Example: Memo Program Transaction [​](https://docs.solanamobile.com/android-native/building_transactions\#example-memo-program-transaction "Direct link to Example: Memo Program Transaction")

In the following example, we are creating a `Transaction` that invokes the [Memo Program](https://spl.solana.com/memo) to publish the message "Hello Solana" on-chain.

### Create an instruction [​](https://docs.solanamobile.com/android-native/building_transactions\#create-an-instruction "Direct link to Create an instruction")

A transaction instruction is comprised of a program id, a list of accounts, and instruction data specific to the program.

To create an instruction, define a list of `AccountMeta` that represent the accounts required by the instruction.
Then pass the encoded message as `data` into the `TransactionInstruction` constructor.

```codeBlockLines_e6Vv
import com.solana.publickey.*
import com.solana.transaction.*

// Solana Memo Program
val memoProgramId = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
val memoProgramIdKey = SolanaPublicKey.from(memoProgramId)

// Construct the instruction
val message = "Hello Solana!"
val memoInstruction = TransactionInstruction(
    memoProgramIdKey,
    // Define the accounts in instruction
    listOf(AccountMeta(address, true, true)),
    // Pass in the instruction data as ByteArray
    message.encodeToByteArray()
)

```

### Create the Memo transaction [​](https://docs.solanamobile.com/android-native/building_transactions\#create-the-memo-transaction "Direct link to Create the Memo transaction")

After creating the instructions, use `Message.Builder()` to assemble the instructions and a _blockhash_ to construct the a _Transaction message_. Then
pass the transaction message into the `Transaction` constructor.

See the previous _Making RPC Requests_ guide for an example of how to fetch a blockhash.

```codeBlockLines_e6Vv
import com.solana.rpc.SolanaRpcClient
import com.solana.networking.KtorNetworkDriver

// Fetch blockhash from RPC
val rpcClient = SolanaRpcClient("https://api.devnet.solana.com", KtorNetworkDriver())
val blockhasResponse = rpcClient.getLatestBlockhash()

if (response.error) {
    println("Failed to fetch latest blockhash: ${response.error.message}")
    return;
}

// Build transaction message
val memoTxMessage = Message.Builder()
    .addInstruction(memoInstruction) // Pass in instruction from previous step
    .setRecentBlockhash(blockhasResponse.result!!.blockhash)
    .build()

// Construct the Transaction object from the message
val unsignedTx = Transaction(memoTxMessage)

```

## Next steps [​](https://docs.solanamobile.com/android-native/building_transactions\#next-steps "Direct link to Next steps")

Read the following _Using Mobile Wallet Adapter_ guide to learn how to sign these transactions and submit them to the Solana network.

- [Add dependencies](https://docs.solanamobile.com/android-native/building_transactions#add-dependencies)
- [Example: Memo Program Transaction](https://docs.solanamobile.com/android-native/building_transactions#example-memo-program-transaction)
  - [Create an instruction](https://docs.solanamobile.com/android-native/building_transactions#create-an-instruction)
  - [Create the Memo transaction](https://docs.solanamobile.com/android-native/building_transactions#create-the-memo-transaction)
- [Next steps](https://docs.solanamobile.com/android-native/building_transactions#next-steps)