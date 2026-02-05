import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { config } from '../utils/config';

// Use PublicNode RPC (more reliable for token queries)
const RPC_URL = config.solanaRpcUrl || 'https://solana-rpc.publicnode.com';
const connection = new Connection(RPC_URL, 'confirmed');

// $FUEL token has 9 decimals
const TOKEN_DECIMALS = 9;

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
      // Convert from raw amount (9 decimals) to human readable
      return Number(account.amount) / Math.pow(10, TOKEN_DECIMALS);
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
    return supply.value.uiAmount || 1_000_000_000;
  } catch (error) {
    console.error('Error getting total supply:', error);
    return 1_000_000_000; // Fallback to 1B
  }
}

/**
 * Get circulating supply
 * Circulating = Total - Treasury - Team (locked)
 * For AIFuel: 200M in liquidity pool = circulating
 */
export async function getCirculatingSupply(): Promise<number> {
  // Hardcoded for now: 200M in liquidity is the circulating supply
  // Treasury (350M), Team (150M), Operations (180M), Marketing (120M) are not in circulation
  return 200_000_000;
}

/**
 * Check if wallet has ever transferred tokens (for diamond hands)
 * This would require indexing historical transactions
 * For MVP, we track this in our database via sell events
 */
export async function hasEverTransferred(walletAddress: string): Promise<boolean> {
  // TODO: Implement transaction history check
  // For now, return false (assume diamond hands)
  return false;
}
