Using Mobile Wallet Adapter
The Mobile Wallet Adapter protocol is a spec that enables a secure communication exchange between a dApp and an MWA-compliant wallet app installed on the device.

Mobile Wallet Adapter 2.0 is the newest and current version of the Mobile Wallet Adapter protocol. The complete 2.0 spec is viewable here.

Add dependencies
Solana Mobile has published two React Native libraries to use Mobile Wallet Adapter.

@solana-mobile/mobile-wallet-adapter-protocol is the core library that implements the Mobile Wallet Adapter protocol for React Native.
@solana-mobile/mobile-wallet-adapter-protocol-web3js is a convenience wrapper package around the core library that enables use of common types from @solana/web3.js – such as Transaction and Uint8Array.
These libraries provide a convenient API to connect, issue signing requests to a locally installed wallet app, and receive responses.

yarn
npm
yarn install @solana-mobile/mobile-wallet-adapter-protocol-web3js \
             @solana-mobile/mobile-wallet-adapter-protocol

Establishing an MWA session
API Reference
To establish a session, or request to 'connect', with an MWA wallet, use the transact method provided by @solana-mobile/mobile-wallet-adapter-protocol-web3js.

Calling transact dispatches an assocication intent to a locally installed MWA wallet app and prompts the user to approve or reject the connection request.

Once session is established, the user can begin issuing MWA requests and receiving responses from the wallet app within the provided callback.

import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

await transact(async (wallet: Web3MobileWallet) => {
  /* ...In callback, send requests to `wallet`... */
});

tip
Use the transact function from @solana-mobile/mobile-wallet-adapter-protocol-web3js rather than @solana-mobile/mobile-wallet-adapter-protocol.

The former provides convenient wrappers around common web3.js Solana types like Transaction while the latter provides base64 encoded byte payloads.

Connecting to a wallet
API Reference
After session establishment, you can connect to the wallet by issuing an authorize request. This authorization step is required if you want to request signing services from the wallet.

Define the App Identity of your dApp so that the wallet app can properly display your dApp info to the user.

name: The name of your app.
uri: The web URL associated with your app.
icon: A path to your app icon relative to the app uri above.
import {transact, Web3MobileWallet} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

export const APP_IDENTITY = {
  name: 'React Native dApp',
  uri:  'https://yourdapp.com'
  icon: "favicon.ico", // Full path resolves to https://yourdapp.com/favicon.ico
};

const authorizationResult = await transact(async (wallet: Web3MobileWallet) => {
    const authorizationResult = await wallet.authorize({
        cluster: 'solana:devnet',
        identity: APP_IDENTITY,
    });

    /* After approval, signing requests are available in the session. */

    return authorizationResult;
});

console.log("Connected to: " + authorizationResult.accounts[0].address)


Authorization Result

If the user approves, the wallet returns an AuthorizationResult response that contains the user's authorized wallet accounts, an auth_token, and wallet_uri_base.

In practice, most wallet apps currently only support single account authorization, so there will be at most 1 item in accounts.

type AuthorizationResult = Readonly<{
  accounts: Account[];
  auth_token: AuthToken;
  wallet_uri_base: string;
  sign_in_result?: SolanaSignInOutput;
}>;

See the SDK reference for a full explanation of the AuthorizationResult response type.

Connecting with an auth_token
For subsequent sessions with the wallet app, you can skip the authorization step by including an auth_token in the authorize request.

If valid, the user is able to skip the connection approval dialog for authorization.

import {transact, Web3MobileWallet} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

export const APP_IDENTITY = {
  name: 'React Native dApp',
  uri:  'https://yourdapp.com'
  icon: "./favicon.ico",
};

// If we have one, retrieve an authToken from a previous authorization.
const storedAuthToken = maybeGetStoredAuthToken(); // dummy placeholder function

await transact(async (wallet: Web3MobileWallet) => {
    // If we have a previously stored authToken, we can pass it into `authorize`.
    const authorizationResult = await wallet.authorize({
        chain: 'solana:devnet',
        identity: APP_IDENTITY,
        auth_token: storedAuthToken ? storedAuthToken: undefined,
    });

    // Rest of transact code goes below...
});


Deauthorizing a wallet
API Reference
A dApp can revoke authorization or "disconnect" from a wallet by sending a deauthorize request. The wallet invalidate the provided authToken.

await transact(async (wallet) => {
  if (!previouslyStoredAuthToken) {
    return;
  }

  // Pass in the prior auth token to invalidate it.
  await wallet.deauthorize({ auth_token: previouslyStoredAuthToken });
});

Sign in with Solana
To connect to a wallet and simultaneously verify the user's ownership of the wallet, use the Sign in with Solana feature. SIWS combines the authorize and signMessage step and returns a SolanaSignInOutput that can be verified by the dApp.

To initiate SIWS, include the optional sign_in_payload parameter in the authorize request. If provided, the wallet will display a dedicated SIWS UI and prompt the user to sign in by signing the statement message.

const signInResult = await transact(async (wallet: Web3MobileWallet) => {
  const authorizationResult = await wallet.authorize({
    chain: 'solana:devnet',
    identity: APP_IDENTITY,
    sign_in_payload: {
      domain: 'yourdomain.com',
      statement: 'Sign into React Native Sample App',
      uri: 'https://yourdomain.com',
    },
  });

  return authorizationResult.sign_in_result;
}

Verifying the sign-in result
If approved, the wallet will include a sign_in_result payload in the AuthorizationResult response. The dApp can then verify that the sign_in_result was correctly signed by the user's wallet.

The @solana/wallet-standard-util library provides a verifySignIn helper method for SIWS message and signature verification.

import type {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";

export function verifySIWS(
  input: SolanaSignInInput,
  output: SolanaSignInOutput
): boolean {
  const serialisedOutput: SolanaSignInOutput = {
    account: {
      publicKey: new Uint8Array(output.account.publicKey),
      ...output.account,
    },
    signature: new Uint8Array(output.signature),
    signedMessage: new Uint8Array(output.signedMessage),
  };
  return verifySignIn(input, serialisedOutput);
}

See the Phantom SIWS docs for more information. It is written for web dApps, but can be extrapolated for mobile dApps.

Signing and sending a transaction
API Reference
To request a wallet to sign and then send a Solana transaction, use the signAndSendTransactions method. With this method, the wallet will handle both signing the transactions then submitting them to the Solana network.

This request sends an unsigned transaction to the wallet. If authorized, the wallet will then sign the transaction and send it to the network with its own implementation.

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
const txSignature = await transact((wallet) => {
  // Authorize the wallet session
  const authorizationResult = await wallet.authorize({
    cluster: "solana:devnet",
    identity: APP_IDENTITY,
  });

  // Convert base64 address to web3.js PublicKey class
  const authorizedPubkey = new PublicKey(
    toByteArray(authorizationResult.accounts[0].address)
  );

  // Construct an instruction to transfer 1,000,000 lamports to a randomly generated account
  const randomKeypair = Keypair.generate();
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: authorizedPubkey,
      toPubkey: randomKeypair.publicKey,
      lamports: 1_000_000,
    }),
  ];

  // Construct the Versioned message and transaction.
  const txMessage = new TransactionMessage({
    payerKey: authorizedPubkey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const transferTx = new VersionedTransaction(txMessage);

  // Send the unsigned transaction, the wallet will sign and submit it to the network,
  // returning the transaction signature.
  const transactionSignatures = await wallet.signAndSendTransactions({
    transactions: [transferTx],
  });

  return transactionSignatures[0];
});

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


The result from sending a transaction is a base58 transaction signature (or transaction ID). This transaction signature can be used to uniquely identify your transaction on the ledger.

Using confirmTransaction, you can check that the transaction was confirmed by the network. For other commitment levels, read about Commitment Status.

Signing Transactions
API Reference
Alternatively, you can request the wallet to just sign a transaction by issuing a signTransactions request.

Versioned Transactions
Legacy Transactions
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { toByteArray } from "react-native-quick-base64";

// Connect to an RPC endpoint and get the latest blockhash, to include in
// the transaction.
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const latestBlockhash = await connection.getLatestBlockhash();

const signedTx = await transact(async (wallet) => {
  /* ...transaction code from above... */
  const transferTx = new VersionedTransaction(txMessage);

  // Request to sign the transaction
  const signedTxs = await wallet.signTransactions({
    transactions: [transferTx],
  });

  return signedTxs[0];
});

The response returned will be a signed Transaction that can be submitted to an RPC endpoint with the sendTransaction function from the Connection class.

Signing messages
API Reference
To request off-chain message signing, issue a signMessages request. In this case, a message is any payload of bytes.

import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

// Convert 'Hello world!' to a byte array.
const message = 'Hello world!'
const messageBuffer = new Uint8Array(
  message.split('').map(c => c.charCodeAt(0)),
);

const signedMessages = await transact(async (wallet) => {
  // Authorize the wallet session.
  const authorizationResult = await wallet.authorize({
      cluster: 'solana:devnet',
      identity: APP_IDENTITY,
  });

  // Request to sign the payload with the authorized account.
  const signedMessages = wallet.signMessages({
    addresses: [authorizationResult.accounts[0].address].
    payloads: [messageBuffer]
  })

  return signedMessages;
});

The response returned will be an Uint8Array[], where each item corresponds to the signed message input.

Next Steps
Browse the collection of Sample Apps to reference a full Solana React Native app.

View the Anchor Integration guide to learn how to interact with Anchor programs in React Native.