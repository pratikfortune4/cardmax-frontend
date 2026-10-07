'use client'
import { IconShield, IconCreditCard } from '@/components/Icons';


import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './Footer.scss'

const HIDDEN_ROUTES = [
  '/login',
  '/logout',
  '/consent-onboarding',
  '/complete-profile',
]

export const Footer: React.FC = () => {
  const pathname = usePathname()
  const swaggerUrl = process.env.NEXT_PUBLIC_SWAGGER_URL || ''
  const docsUrl = process.env.NEXT_PUBLIC_API_DOCS_URL || ''

  const shouldHide = HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  if (shouldHide) {
    return null
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="cm-footer" role="contentinfo">
      <div className="cm-footer__inner">
        <div className="cm-footer__left">
          <Link href="/" className="cm-footer__brand" aria-label="CardMax Home">
            <div className="cm-footer-brand-icon">
              <IconCreditCard />
            </div>
            <div>
              <span>Card</span>
              <span className="cm-brand-accent">Max</span>
            </div>
          </Link>
          <div className="cm-footer__tagline">
            Smart credit card optimization platform.
          </div>
          <div className="cm-footer__security-inline">
            <IconShield />
            <span>Bank-grade security (256-bit encryption)</span>
          </div>
        </div>

        <div className="cm-footer__middle">
          <ul className="cm-footer__inline-links">
            <li><Link href="/terms-and-conditions">Terms</Link></li>
            <li><Link href="/privacy-and-policy">Privacy</Link></li>
            <li><Link href="/settings/consent">Consent</Link></li>
            <li><Link href={swaggerUrl} target="_blank" rel="noopener noreferrer">Swagger API</Link></li>
          </ul>
          <div className="cm-footer__copyright">
            &copy; {currentYear} CardMax, Inc.
          </div>
        </div>

        <div className="cm-footer__right">
          <div className="cm-system-status" title="All CardMax engines and sync services are operational">
            <span className="cm-status-dot" aria-hidden="true" />
            <span>Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
