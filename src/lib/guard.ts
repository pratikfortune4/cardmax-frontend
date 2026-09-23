import type { User } from '@/types'
import { CURRENT_TOS_VERSION, CURRENT_PRIVACY_VERSION } from '@/lib/consentVersions'

export function hasRequiredConsent(user: User | null | undefined): boolean {
  if (!user) return false

  const hasValidTos = Boolean(
    user.acceptedTermsAndConditions === true &&
    user.tosVersion &&
    user.tosVersion === CURRENT_TOS_VERSION,
  )

  const hasValidPrivacy = Boolean(
    user.acceptedPrivacyPolicy === true &&
    user.privacyNoticeVersion &&
    user.privacyNoticeVersion === CURRENT_PRIVACY_VERSION,
  )

  return hasValidTos && hasValidPrivacy
}

export function isProfileComplete(user: User | null | undefined): boolean {
  if (!user) return false
  if (user.profileCompleted) return true
  const hasContact = Boolean(user.email || user.phone)
  const hasName = Boolean(user.name)
  return hasContact && hasName
}
