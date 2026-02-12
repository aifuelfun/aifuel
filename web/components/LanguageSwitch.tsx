'use client'

import { FC } from 'react'
import { Locale } from '@/lib/i18n'

interface Props {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LanguageSwitch: FC<Props> = ({ locale, setLocale }) => {
  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
      className="px-2 py-1 text-sm rounded text-text-dim hover:text-primary transition"
    >
      {locale === 'en' ? '中' : 'EN'}
    </button>
  )
}
