'use client'

import { FC } from 'react'
import { Locale } from '@/lib/i18n'

interface Props {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LanguageSwitch: FC<Props> = ({ locale, setLocale }) => {
  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLocale('en')}
        className={`px-2 py-1 rounded transition ${
          locale === 'en' 
            ? 'bg-primary text-white' 
            : 'text-gray-600 hover:text-primary'
        }`}
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => setLocale('zh')}
        className={`px-2 py-1 rounded transition ${
          locale === 'zh' 
            ? 'bg-primary text-white' 
            : 'text-gray-600 hover:text-primary'
        }`}
      >
        中
      </button>
    </div>
  )
}
