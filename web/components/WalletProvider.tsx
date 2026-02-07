'use client'

import { FC, ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter, 
  CoinbaseWalletAdapter, 
  TrustWalletAdapter 
} from '@solana/wallet-adapter-wallets'
import { SOLANA_RPC_URL } from '@/lib/constants'

interface Props {
  children: ReactNode
}

export const WalletProvider: FC<Props> = ({ children }) => {
  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
      // OKX Wallet is auto-detected if installed
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_URL}>
      <SolanaWalletProvider wallets={wallets} autoConnect storage={localStorage}>
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}
