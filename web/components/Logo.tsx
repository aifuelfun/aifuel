'use client'

import { FC } from 'react'
import Image from 'next/image'

interface Props {
  size?: number
  className?: string
}

export const Logo: FC<Props> = ({ size = 32, className = '' }) => {
  return (
    <Image 
      src="/logo.webp" 
      alt="AIFuel" 
      width={size} 
      height={size} 
      className={`rounded-lg ${className}`}
    />
  )
}
