'use client'

import { FC } from 'react'
import Link from 'next/link'
import { Twitter, MessageCircle, Github } from 'lucide-react'
import { SOCIAL_LINKS } from '@/lib/constants'
import { Logo } from './Logo'

interface Props {
  t: (key: any) => string
}

export const Footer: FC<Props> = ({ t }) => {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Logo size={32} />
              <span className="text-xl font-bold">AIFuel</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              {t('footerDesc')}
            </p>
            <div className="flex gap-4">
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-primary transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-primary transition">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-primary transition">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('product')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition">
                  {t('documentation')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/models" className="text-gray-400 hover:text-white transition">
                  Models
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">{t('resources')}</h3>
            <ul className="space-y-2">
              <li>
                <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition">
                  GitHub
                </a>
              </li>
              <li>
                <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition">
                  Discord
                </a>
              </li>
              <li>
                <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2026 AIFuel. {t('allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  )
}
