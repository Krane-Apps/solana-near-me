---
url: "https://docs.solanapay.com/api/core/function/createTransfer"
title: "createTransfer | API | Solana Pay Docs"
---

[Skip to main content](https://docs.solanapay.com/api/core/function/createTransfer#)

### Callable

- createTransfer(connection: Connection, sender: PublicKey, fields: [CreateTransferFields](https://docs.solanapay.com/api/core/interface/CreateTransferFields), options?: { commitment?: Commitment }): Promise<Transaction>

* * *

- Create a Solana Pay transfer transaction.





**@throws**



{CreateTransferError}






* * *



#### Parameters



  - ##### connection: Connection








    A connection to the cluster.

  - ##### sender: PublicKey








    Account that will send the transfer.

  - ##### fields: [CreateTransferFields](https://docs.solanapay.com/api/core/interface/CreateTransferFields)








    Fields of a Solana Pay transfer request URL.

  - ##### options: { commitment?: Commitment } = {}








    Options for `getRecentBlockhash`.


#### Returns Promise<Transaction>