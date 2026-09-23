export interface User {
  id: string | number
  email: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  income?: number | null
  employmentType?: string | null
  pan?: string | null
  hasPan?: boolean
  profileCompleted?: boolean
  accountStatus?: string
  isPro?: boolean
  tosVersion?: string | null
  acceptedTermsAndConditions?: boolean
  acceptedTermsAt?: string | null
  privacyNoticeVersion?: string | null
  acceptedPrivacyPolicy?: boolean
  acknowledgedPrivacyAt?: string | null
  marketingConsent?: boolean
  marketingConsentAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface NavbarUser {
  id: string
  email: string
  name?: string | null
  isPro?: boolean
}

export interface DashboardData {
  user: {
    name: string
    email: string
    isPro: boolean
  }
  metrics: {
    totalCards: number
    activeCardsCount: number
    totalCreditLimit: number
    nextDue: {
      cardName?: string
      dueDateFormatted?: string
      daysRemaining?: number
      hasUpcomingDue: boolean
    }
  }
  gmailConnected: boolean
  recommendations: Array<{
    category: string
    categorySlug?: string
    cardName?: string
    icon: string
    bestCard: string
    multiplier: string
    perkSummary: string
    isOwned: boolean
  }>
  recentStatementsCount: number
}

export interface BestCardByCategoryItem {
  category: string
  categorySlug: string
  cardName: string
  bankName: string
  annualFeeINR: number
  isCashback: boolean
  cashbackPercent: number
  rewardPointsPer100: number
  pointValueINR: number
  defaultMonthlySpend: number
  earningMechanism: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  status: string
  type: string
  channel: string
  createdAt: string
  actionUrl?: string
}

export interface ConsentSummary {
  consents: {
    analyse_inbox: 'granted' | 'revoked' | 'not_set'
    persist_derived: 'granted' | 'revoked' | 'not_set'
  }
  marketing: boolean
  gmailConnected: boolean
  gmailAddress?: string
  gmailConnectedAt?: string
  legalVersions: {
    tosVersion: string | null
    acceptedTermsAt: string | null
    privacyNoticeVersion: string | null
    acknowledgedPrivacyAt: string | null
  }
}
