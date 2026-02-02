import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { config } from '../utils/config';

const connection = new Connection(config.solanaRpcUrl, 'confirmed');

/**
 * Get token balance for a wallet
 */
export async function getTokenBalance(walletAddress: string): Promise<number> {
  try {
    const walletPubkey = new PublicKey(walletAddress);
    const mintPubkey = new PublicKey(config.fuelTokenMint);
    
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
    
    try {
      const account = await getAccount(connection, tokenAccount);
      // Convert from raw amount (with decimals) to human readable
      // Assuming 6 decimals
      return Number(account.amount) / 1_000_000;
    } catch (e) {
      // Token account doesn't exist = 0 balance
      return 0;
    }
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
}

/**
 * Get total token supply
 */
export async function getTotalSupply(): Promise<number> {
  try {
    const mintPubkey = new PublicKey(config.fuelTokenMint);
    const supply = await connection.getTokenSupply(mintPubkey);
    return supply.value.uiAmount || 0;
  } catch (error) {
    console.error('Error getting total supply:', error);
    return 1_000_000_000; // Fallback to 1B
  }
}

/**
 * Get circulating supply (total - locked wallets)
 * For now, just return total supply. In production, subtract team/reserve wallets.
 */
export async function getCirculatingSupply(): Promise<number> {
  const total = await getTotalSupply();
  // TODO: Subtract locked wallets
  return total * 0.5; // Assume 50% circulating for now
}

/**
 * Verify a wallet signature
 */
export function verifySignature(
  message: string,
  signature: Uint8Array,
  publicKey: PublicKey
): boolean {
  const nacl = require('tweetnacl');
  const messageBytes = new TextEncoder().encode(message);
  return nacl.sign.detached.verify(messageBytes, signature, publicKey.toBytes());
}
