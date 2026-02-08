'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'

export default function Dashboard() {
  const router = useRouter()
  const { connected } = useWallet()
  
  useEffect(() => {
    // Redirect to home - wallet panel is now on home page
    router.replace('/')
  }, [router])
  
  return null
}