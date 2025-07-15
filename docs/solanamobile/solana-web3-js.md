Making RPC requests
To interface with the Solana network, a client needs to construct and send JSON RPC requests to an RPC endpoint.

Add dependencies
The @solana/web3.js library provides a convenient RPC client Connection class that has an API for submitting RPC requests to a JSON RPC endpoint.

yarn
npm
yarn install @solana/web3.js@1 \
             react-native-get-random-values \
             buffer

Add polyfills
After installing, ensure you have also added these polyfills to the index.js of your React native app. These are needed in some parts of @solana/web3.js because it is originally written as a web/node library and, as a result, certain expected APIs are missing in a React Native environment.

Creating a Connection client
The Connection class represents a connection to a Solana RPC endpoint and provides convenient functions to make RPC requests.

Construct a Connection client by passing in an RPC endpoint and an optional commitment config:

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

The Connection class created can be reused throughout your application.

Usage
After creation, call various asynchronous RPC functions and receive responses from the RPC endpoint.

// `getLatestBlockhash` RPC request
const blockhash = await connection.getLatestBlockhash();

// `getBalance` RPC request
const balanceInLamports = await connection.getBalance();

// Sending a Transaction
const txSignature = await sendTransaction(tx);

View the official documentation to see the full list of available RPC functions, parameter types, and response types.

Next steps
Read the following Building transactions guide to learn how to create transactions that interact with on-chain Solana Programs.
Browse the full list of Solana RPC HTTP Methods

Building transactions
A client interacts with the Solana network by submitting a transaction to the cluster. Transactions allow a client to invoke instructions of on-chain Programs.

For a full explanation, see the core docs overview of a transaction.

Add dependencies
The @solana/web3.js library provides convenient classes and Solana primitive types to build transactions.

yarn
npm
yarn install @solana/web3.js

Add polyfills
After installing, ensure you have also added these polyfills to your React native app. These are needed by some parts of @solana/web3.js because it is originally written as a web/node library and, as a result, certain expected APIs are missing in a React Native environment.

Example: SOL Transfer Transaction
In the following example, we create a transaction that invokes the System Program's transfer instruction to send SOL to an address.

A transaction instruction is comprised of a program id, a list of accounts, and instruction data specific to the program.

Versioned Transactions
Legacy Transactions
A versioned transaction is a new format for transactions recommended for use by clients.

As an example, we'll be invoking the transfer instruction from the System Program. Use the SystemProgram factory class to conveniently generate the transfer instruction.

import {
  Connection,
  PublicKey,
  VersionedTransaction,
  SystemProgram,
} from "@solana/web3.js";

// Create a list of Program instructions to execute.
const instructions = [
  SystemProgram.transfer({
    fromPubkey: fromPublicKey,
    toPubkey: toPublicKey,
    lamports: 1_000_000,
  }),
];

// Connect to an RPC endpoint and get the latest blockhash, to include in
// the transaction.
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const latestBlockhash = await connection.getLatestBlockhash();

// Create the "message" of a transaction and compile to `V0Message` format.
const txMessage = new TransactionMessage({
  payerKey: fromPublicKey,
  recentBlockhash: latestBlockhash.blockhash,
  instructions,
}).compileToV0Message();

// Construct the Versioned Transaction passing in the message.
const versionedTransaction = new VersionedTransaction(txMessage);

Send a Transaction
After a transaction is signed by the appropriate accounts, it can be submitted to the Solana network via RPC. See the next guide, Using Mobile Walelt Adapter to learn how to sign transactions.

Versioned Transactions
Legacy Transactions
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  sendTransaction,
  clusterApiUrl,
  Connection,
  VersionedTransaction,
  confirmTransaction,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const unsignedTx = new VersionedTransaction(/* ... */);
const signedTx: VersionedTransaction = await transact((wallet) => {
  /* ...sign `unsignedTx` with Mobile Wallet Adapter... */
});

// After sending, a transaction signature is returned.
const txSignature = await connection.sendTransaction(signedTx);

// Confirm the transaction was successful.
const confirmationResult = await connection.confirmTransaction(
  txSignature,
  "confirmed"
);

if (confirmationResult.value.err) {
  throw new Error(JSON.stringify(confirmationResult.value.err));
} else {
  console.log("Transaction successfully submitted!");
}

Next steps
Read the following Using Mobile Wallet Adapter guide to learn how to sign these transactions and submit them to the Solana network.
See the Anchor Integration guide to learn how to create and create transactions and invoke instructions from Anchor programs.