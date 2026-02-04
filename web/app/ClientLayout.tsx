'use client'

import { Navbar, Footer } from '@/components'
import { useLocale } from '@/lib/LocaleContext'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, t } = useLocale()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar locale={locale} setLocale={setLocale} t={t} />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer t={t} />
    </div>
  )
}
