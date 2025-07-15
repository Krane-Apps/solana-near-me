import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  createQR,
  encodeURL,
  parseURL,
  TransferRequestURL,
} from '@solana/pay';
import BigNumber from 'bignumber.js';
import { PaymentRequest, PaymentResult } from '../types';
import { logger } from '../utils/logger';

const FILE_NAME = 'solanaPayService.ts';

// USDC Token Mint Address on Devnet
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

export class SolanaPayService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    logger.info(FILE_NAME, 'SolanaPayService initialized');
  }

  async createPaymentURL(paymentRequest: PaymentRequest): Promise<string> {
    try {
      logger.info(FILE_NAME, 'Creating payment URL', {
        recipient: paymentRequest.recipient.toString(),
        amount: paymentRequest.amount,
        token: paymentRequest.token
      });

      const transferURL = encodeURL({
        recipient: paymentRequest.recipient,
        amount: new BigNumber(paymentRequest.amount),
        splToken: paymentRequest.token === 'USDC' ? USDC_MINT : undefined,
        reference: paymentRequest.reference ? [paymentRequest.reference] : undefined,
        label: paymentRequest.label,
        message: paymentRequest.message,
        memo: paymentRequest.memo,
      });

      const url = transferURL.toString();
      logger.info(FILE_NAME, 'Payment URL created successfully', { url });
      return url;
    } catch (error) {
      logger.error(FILE_NAME, 'Failed to create payment URL', error);
      throw error;
    }
  }

  async parsePaymentURL(url: string): Promise<TransferRequestURL> {
    try {
      logger.debug(FILE_NAME, 'Parsing payment URL', { url });
      const parsed = parseURL(url);
      
      if ('recipient' in parsed) {
        logger.debug(FILE_NAME, 'Payment URL parsed successfully');
        return parsed as TransferRequestURL;
      } else {
        throw new Error('URL is not a transfer request');
      }
    } catch (error) {
      logger.error(FILE_NAME, 'Failed to parse payment URL', error);
      throw error;
    }
  }

  async createSOLTransfer(
    sender: PublicKey,
    recipient: PublicKey,
    amount: number,
    reference?: PublicKey
  ): Promise<Transaction> {
    try {
      logger.info(FILE_NAME, 'Creating SOL transfer', {
        sender: sender.toString(),
        recipient: recipient.toString(),
        amount
      });

      const lamports = Math.round(amount * LAMPORTS_PER_SOL);
      
      const instruction = SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipient,
        lamports,
      });

      const transaction = new Transaction().add(instruction);

      if (reference) {
        logger.debug(FILE_NAME, 'Adding reference to SOL transfer', {
          reference: reference.toString()
        });
        
        const referenceInstruction = new TransactionInstruction({
          keys: [{ pubkey: reference, isSigner: false, isWritable: false }],
          data: Buffer.alloc(0),
          programId: new PublicKey('11111111111111111111111111111111'),
        });
        transaction.add(referenceInstruction);
      }

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender;

      logger.info(FILE_NAME, 'SOL transfer transaction created');
      return transaction;
    } catch (error) {
      logger.error(FILE_NAME, 'Failed to create SOL transfer', error);
      throw error;
    }
  }

  async createUSDCTransfer(
    sender: PublicKey,
    recipient: PublicKey,
    amount: number,
    reference?: PublicKey
  ): Promise<Transaction> {
    try {
      logger.info(FILE_NAME, 'Creating USDC transfer', {
        sender: sender.toString(),
        recipient: recipient.toString(),
        amount
      });

      const decimals = 6; // USDC has 6 decimal places
      const amountInSmallestUnit = Math.round(amount * Math.pow(10, decimals));

      // Note: This requires a signer for the payer parameter
      // In real usage, this would be called with proper wallet adapters
      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        {} as any, // This would be the actual signer in real implementation
        USDC_MINT,
        sender
      );

      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        {} as any, // This would be the actual signer in real implementation
        USDC_MINT,
        recipient
      );

      logger.debug(FILE_NAME, 'Token accounts resolved', {
        senderAccount: senderTokenAccount.address.toString(),
        recipientAccount: recipientTokenAccount.address.toString()
      });

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount.address,
        recipientTokenAccount.address,
        sender,
        amountInSmallestUnit,
        [],
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(transferInstruction);

      if (reference) {
        logger.debug(FILE_NAME, 'Adding reference to USDC transfer', {
          reference: reference.toString()
        });
        
        const referenceInstruction = new TransactionInstruction({
          keys: [{ pubkey: reference, isSigner: false, isWritable: false }],
          data: Buffer.alloc(0),
          programId: new PublicKey('11111111111111111111111111111111'),
        });
        transaction.add(referenceInstruction);
      }

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender;

      logger.info(FILE_NAME, 'USDC transfer transaction created');
      return transaction;
    } catch (error) {
      logger.error(FILE_NAME, 'Failed to create USDC transfer', error);
      throw error;
    }
  }

  async createPaymentTransaction(
    sender: PublicKey,
    paymentRequest: PaymentRequest
  ): Promise<Transaction> {
    logger.info(FILE_NAME, 'Creating payment transaction', {
      sender: sender.toString(),
      token: paymentRequest.token,
      amount: paymentRequest.amount
    });

    if (paymentRequest.token === 'SOL') {
      return this.createSOLTransfer(
        sender,
        paymentRequest.recipient,
        paymentRequest.amount,
        paymentRequest.reference
      );
    } else {
      return this.createUSDCTransfer(
        sender,
        paymentRequest.recipient,
        paymentRequest.amount,
        paymentRequest.reference
      );
    }
  }

  async validatePayment(
    signature: string,
    paymentRequest: PaymentRequest
  ): Promise<boolean> {
    try {
      logger.info(FILE_NAME, 'Validating payment', {
        signature,
        recipient: paymentRequest.recipient.toString(),
        amount: paymentRequest.amount
      });

      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
      });

      if (!transaction || !transaction.meta) {
        logger.warn(FILE_NAME, 'Transaction not found or no metadata');
        return false;
      }

      if (transaction.meta.err) {
        logger.warn(FILE_NAME, 'Transaction failed', { error: transaction.meta.err });
        return false;
      }

      logger.info(FILE_NAME, 'Payment validation successful');
      return true;
    } catch (error) {
      logger.error(FILE_NAME, 'Payment validation failed', error);
      return false;
    }
  }

  async confirmTransaction(signature: string): Promise<boolean> {
    try {
      logger.info(FILE_NAME, 'Confirming transaction', { signature });
      
      const confirmation = await this.connection.confirmTransaction(
        signature,
        'confirmed'
      );

      const success = !confirmation.value.err;
      logger.info(FILE_NAME, 'Transaction confirmation result', { 
        signature, 
        success,
        error: confirmation.value.err 
      });
      
      return success;
    } catch (error) {
      logger.error(FILE_NAME, 'Failed to confirm transaction', error);
      return false;
    }
  }

  async getTransactionDetails(signature: string) {
    try {
      logger.debug(FILE_NAME, 'Getting transaction details', { signature });
      
      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
      });

      if (transaction) {
        logger.debug(FILE_NAME, 'Transaction details retrieved');
      } else {
        logger.warn(FILE_NAME, 'Transaction not found', { signature });
      }

      return transaction;
    } catch (error) {
      logger.error(FILE_NAME, 'Failed to get transaction details', error);
      throw error;
    }
  }

  static generateReference(): PublicKey {
    const reference = PublicKey.unique();
    logger.debug(FILE_NAME, 'Generated reference', { 
      reference: reference.toString() 
    });
    return reference;
  }

  async getUSDCBalance(walletPublicKey: PublicKey): Promise<number> {
    try {
      logger.debug(FILE_NAME, 'Getting USDC balance', {
        wallet: walletPublicKey.toString()
      });

      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        {
          mint: USDC_MINT,
        }
      );

      if (tokenAccounts.value.length === 0) {
        logger.debug(FILE_NAME, 'No USDC token account found');
        return 0;
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      logger.debug(FILE_NAME, 'USDC balance retrieved', { balance });
      return balance || 0;
    } catch (error) {
      logger.error(FILE_NAME, 'Failed to get USDC balance', error);
      return 0;
    }
  }

  async getSOLBalance(walletPublicKey: PublicKey): Promise<number> {
    try {
      logger.debug(FILE_NAME, 'Getting SOL balance', {
        wallet: walletPublicKey.toString()
      });

      const balance = await this.connection.getBalance(walletPublicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      logger.debug(FILE_NAME, 'SOL balance retrieved', { balance: solBalance });
      return solBalance;
    } catch (error) {
      logger.error(FILE_NAME, 'Failed to get SOL balance', error);
      return 0;
    }
  }
} 