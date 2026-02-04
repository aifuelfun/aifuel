'use client'

import { FC, useState, useEffect } from 'react'

interface Props {
  targetDate: Date
  label: string
}

export const Countdown: FC<Props> = ({ targetDate, label }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOpen: false,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOpen: true })
        clearInterval(timer)
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isOpen: false,
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (timeLeft.isOpen) {
    return (
      <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full">
        <span className="text-green-300 font-bold">🎉 Pool is OPEN!</span>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-white/70 mb-2">{label}</p>
      <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-300">{timeLeft.days}</p>
          <p className="text-xs text-white/60">Days</p>
        </div>
        <span className="text-white/40 text-xl">:</span>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-300">{String(timeLeft.hours).padStart(2, '0')}</p>
          <p className="text-xs text-white/60">Hours</p>
        </div>
        <span className="text-white/40 text-xl">:</span>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-300">{String(timeLeft.minutes).padStart(2, '0')}</p>
          <p className="text-xs text-white/60">Min</p>
        </div>
        <span className="text-white/40 text-xl">:</span>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-300">{String(timeLeft.seconds).padStart(2, '0')}</p>
          <p className="text-xs text-white/60">Sec</p>
        </div>
      </div>
    </div>
  )
}
