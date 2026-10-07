'use client'
import { IconSlash, IconCheckSquare, IconShieldCheck, IconCheckCircle, IconMailCheck, IconCompass, IconCreditCard, IconArrowRight, IconStar } from '@/components/Icons';

import React from 'react'
import Link from 'next/link'

export const LandingView: React.FC = () => {
  return (
    <div className="cm-home-wrapper">
      <div className="cm-container">
        {/* Hero Section */}
        <section className="cm-landing-hero">
          <div className="cm-hero-badge">
            <IconStar />
            <span>Next-Gen Credit Card Intelligence</span>
          </div>

          <h1>
            Maximize Every Rupee Spent Across{' '}
            <span className="cm-text-gradient">All Your Credit Cards</span>
          </h1>

          <p className="cm-hero-subtitle">
            CardMax unifies your credit cards into one intelligent dashboard. Track limits, statement cycles, and automatically pick the best card to swipe for 5X–10X rewards.
          </p>

          <div className="cm-hero-actions">
            <Link href="/login" className="cm-btn-primary">
              <span>Get Started Free</span>
              <IconArrowRight />
            </Link>

          </div>
        </section>

        {/* Core Pillars / Feature Highlights */}
        <section className="cm-landing-features" aria-label="Core Features">
          <div className="cm-feature-box">
            <div className="cm-feature-icon">
              <IconCreditCard />
            </div>
            <h3>Unified Card Wallet</h3>
            <p>
              Consolidate cards from HDFC, SBI, ICICI, Axis, Amex, and more. Track aggregate limits, statement dates, and billing cycles in a single glance.
            </p>
          </div>

          <div className="cm-feature-box">
            <div className="cm-feature-icon">
              <IconCompass />
            </div>
            <h3>Rewards Optimizer</h3>
            <p>
              Instant recommendations on which card earns maximum cashback or reward points for dining, flights, fuel surcharge waivers, and groceries.
            </p>
          </div>

          <div className="cm-feature-box">
            <div className="cm-feature-icon">
              <IconMailCheck />
            </div>
            <h3>Automated Statement Sync</h3>
            <p>
              Connect Gmail securely using official Google OAuth. Statements are parsed automatically with bank-grade AES-256 encrypted storage.
            </p>
          </div>

          <div className="cm-feature-box">
            <div className="cm-feature-icon">
              <IconCheckCircle />
            </div>
            <h3>Smart Insights & Tracking</h3>
            <p>
              Automated statement intelligence, annual fee waiver progress tracking, and timely payment due reminders.
            </p>
          </div>
        </section>

        {/* Trust & Security Verification Bar */}
        <section className="cm-trust-bar" aria-label="Security & Compliance Highlights">
          <div className="cm-trust-item">
            <IconShieldCheck />
            <span>256-Bit Bank-Grade Encryption</span>
          </div>

          <div className="cm-trust-item">
            <IconCheckSquare />
            <span>ISO/IEC 27001 Aligned</span>
          </div>

          <div className="cm-trust-item">
            <IconSlash />
            <span>Zero Credential or CVV Storage</span>
          </div>
        </section>
      </div>
    </div>
  )
}
