'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { translations, Locale, TranslationKey } from './i18n'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: any) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale
    if (saved && translations[saved]) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }, [])

  const t = useCallback((key: any, params?: Record<string, any>): string => {
    let text = translations[locale]?.[key as TranslationKey] || translations.en[key as TranslationKey] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v))
      })
    }
    return text
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    // Fallback for when used outside provider (shouldn't happen but just in case)
    const [locale, setLocaleState] = useState<Locale>('en')
    
    useEffect(() => {
      const saved = localStorage.getItem('locale') as Locale
      if (saved && translations[saved]) {
        setLocaleState(saved)
      }
    }, [])

    const setLocale = useCallback((newLocale: Locale) => {
      setLocaleState(newLocale)
      localStorage.setItem('locale', newLocale)
    }, [])

    const t = useCallback((key: any, params?: Record<string, any>): string => {
      let text = translations[locale]?.[key as TranslationKey] || translations.en[key as TranslationKey] || key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`{${k}}`, 'g'), String(v))
        })
      }
      return text
    }, [locale])

    return { locale, setLocale, t }
  }
  return context
}
