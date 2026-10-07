'use client'
import { IconRefreshCw, IconChevronRight, IconMail, IconShield, IconCreditCard, IconShieldCheck, IconLock, IconEdit, IconCalendar, IconPhone, IconX, IconAlertTriangle, IconCheck } from '@/components/Icons';


import React, { useState } from 'react'
import Link from 'next/link'
import { EMPLOYMENT_TYPES } from '@/lib/profileOptions'
import { API_BASE_URL } from '@/lib/api'
import { ConfirmationModal } from '@/components/Confirmation/ConfirmationModal'
import './styles.scss'

export interface UserProfileData {
  id: string | number
  name: string
  email: string
  phone: string
  income: number | null
  employmentType: string | null
  pan?: string | null
  hasPan?: boolean
  authenticationProvider: string
  profileCompleted: boolean
  accountStatus: string
  createdAt?: string
  marketingConsent?: boolean
  stats?: {
    activeCardsCount: number
    totalCardsCount: number
    subscriptionStatus: string
  }
}

interface ProfileViewProps {
  initialUser: UserProfileData
}

export function ProfileView({ initialUser }: ProfileViewProps) {
  const [user, setUser] = useState<UserProfileData>(initialUser)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [updatingMarketing, setUpdatingMarketing] = useState(false)
  const [alert, setAlert] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: initialUser.name || '',
    phone: initialUser.phone || '',
    income: initialUser.income != null ? String(initialUser.income) : '',
    employmentType: initialUser.employmentType || '',
    pan: initialUser.pan || '',
  })

  const [formErrors, setFormErrors] = useState<{
    name?: string
    phone?: string
    income?: string
    pan?: string
  }>({})

  // Format currency
  const formatCurrency = (val: number | null) => {
    if (val == null) return null
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Get Initials for Avatar
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return parts[0].slice(0, 2).toUpperCase()
    }
    if (email && email.trim()) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'CM'
  }

  const handleStartEdit = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      income: user.income != null ? String(user.income) : '',
      employmentType: user.employmentType || '',
      pan: user.pan || '',
    })
    setFormErrors({})
    setIsEditing(true)
    setAlert(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormErrors({})
  }

  const validateForm = () => {
    const errors: { name?: string; phone?: string; income?: string; pan?: string } = {}
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.'
    }
    if (formData.income && (Number.isNaN(Number(formData.income)) || Number(formData.income) < 0)) {
      errors.income = 'Please enter a valid non-negative income amount.'
    }
    if (formData.pan && formData.pan.trim()) {
      const cleanPan = formData.pan.trim().toUpperCase()
      // If user didn't modify an existing masked PAN, allow it
      if (!cleanPan.startsWith('XXXXXX') && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
        errors.pan = 'Please enter a valid 10-character PAN (e.g. ABCDE1234F).'
      }
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    setAlert(null)

    try {
      const body: Record<string, unknown> = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        income: formData.income.trim() ? Number(formData.income) : null,
        employmentType: formData.employmentType || null,
      }

      if (formData.pan && formData.pan.trim()) {
        const cleanPan = formData.pan.trim().toUpperCase()
        if (!cleanPan.startsWith('XXXXXX')) {
          body.pan = cleanPan
        }
      } else if (user.hasPan && !formData.pan) {
        body.pan = null
      }

      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.')
      }

      setUser((prev) => ({
        ...prev,
        name: data.user.name,
        phone: data.user.phone,
        income: data.user.income,
        employmentType: data.user.employmentType,
        pan: data.user.pan !== undefined ? data.user.pan : prev.pan,
        hasPan: data.user.hasPan !== undefined ? data.user.hasPan : prev.hasPan,
      }))

      setIsEditing(false)
      setAlert({ text: 'Profile updated successfully.', type: 'success' })
    } catch (err: any) {
      setAlert({ text: err.message || 'Error updating profile.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleMarketingToggle = async () => {
    const nextVal = !user.marketingConsent
    setUpdatingMarketing(true)
    setAlert(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/consent/marketing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ marketing: nextVal }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update marketing preference.')

      setUser((prev) => ({ ...prev, marketingConsent: nextVal }))
      setAlert({
        text: nextVal
          ? 'Subscribed to product updates & recommendations.'
          : 'Unsubscribed from marketing communications.',
        type: 'success',
      })
    } catch (err: any) {
      setAlert({ text: err.message || 'Failed to update preference.', type: 'error' })
    } finally {
      setUpdatingMarketing(false)
    }
  }

  const handleConfirmLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch(`${API_BASE_URL}/api/users/logout`, { method: 'POST', credentials: 'include' })
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      window.location.href = '/'
    }
  }

  const employmentLabel =
    EMPLOYMENT_TYPES.find((t) => t.value === user.employmentType)?.label || user.employmentType

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Feedback Alert */}
        {alert && (
          <div className={`profile-alert ${alert.type}`} role="alert">
            <div className="alert-content">
              <span className="alert-icon" aria-hidden="true">
                {alert.type === 'success' ? (
                  <IconCheck />
                ) : (
                  <IconAlertTriangle />
                )}
              </span>
              <span>{alert.text}</span>
            </div>
            <button
              type="button"
              className="alert-close"
              onClick={() => setAlert(null)}
              aria-label="Dismiss notification"
            >
              <IconX />
            </button>
          </div>
        )}

        {/* 1. Compact Profile Header */}
        <section className="profile-header" aria-label="Profile identity header">
          <div className="header-primary">
            <div className="avatar" aria-hidden="true">
              {getInitials(user.name, user.email)}
            </div>

            <div className="user-details">
              <div className="name-line">
                <h1>{user.name || 'CardMax Member'}</h1>
                <span className="status-indicator">
                  <span className="dot" />
                  {user.accountStatus || 'Active'}
                </span>
                <span className="provider-pill">
                  {user.authenticationProvider === 'google' ? 'Google Account' : 'Verified Email'}
                </span>
              </div>

              <div className="meta-list">
                {user.email && (
                  <span className="meta-item">
                    <IconMail />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="meta-item">
                    <IconPhone />
                    {user.phone}
                  </span>
                )}
                {user.createdAt && (
                  <span className="meta-item" suppressHydrationWarning>
                    <IconCalendar />
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="header-actions">
            {!isEditing ? (
              <button
                type="button"
                id="btn-edit-profile-hero"
                className="btn-action primary"
                onClick={handleStartEdit}
              >
                <IconEdit />
                Edit Profile
              </button>
            ) : (
              <button type="button" className="btn-action secondary" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}

            <Link href="/settings/consent" className="btn-action secondary">
              <IconShieldCheck />
              Privacy & Consent
            </Link>
          </div>
        </section>

        {/* 2. Compact Account Overview Section (Information At-a-Glance) */}
        <section className="overview-strip" aria-label="Account Overview">
          <Link href="/wallet" className="overview-item">
            <div className="item-icon">
              <IconCreditCard />
            </div>
            <div className="item-info">
              <span className="item-label">Active Cards</span>
              <span className="item-value">{user.stats?.activeCardsCount ?? 0} Active</span>
            </div>
            <span className="item-action">Manage &rarr;</span>
          </Link>


          <div className="overview-divider" aria-hidden="true" />

          <Link href="/settings/consent" className="overview-item">
            <div className="item-icon">
              <IconShield />
            </div>
            <div className="item-info">
              <span className="item-label">Account Security</span>
              <span className="item-value">Protected & Compliant</span>
            </div>
            <span className="item-action">Review &rarr;</span>
          </Link>
        </section>

        {/* 3. Main Content: Two-Column SaaS Layout */}
        <div className="profile-layout">
          {/* Main Column */}
          <main className="main-column">
            <div className="content-panel">
              <div className="panel-header">
                <h2>{isEditing ? 'Edit Profile Details' : 'Account Details'}</h2>
                <p>
                  {isEditing
                    ? 'Update your personal details and income information below.'
                    : 'Personal and financial information used to personalize credit card recommendations.'}
                </p>
              </div>

              {!isEditing ? (
                /* View Mode: Clean Field-Based Layout */
                <div className="profile-fields-wrapper">
                  {/* Personal Information */}
                  <div className="fields-section">
                    <div className="section-title">Personal Information</div>
                    <div className="fields-grid">
                      <div className="field-block">
                        <span className="field-label">Full Name</span>
                        <span className={`field-value ${!user.name ? 'empty' : ''}`}>
                          {user.name || 'Not provided'}
                        </span>
                      </div>

                      <div className="field-block">
                        <span className="field-label">Email Address</span>
                        <span className="field-value email-value">
                          {user.email || 'None'}
                          <span className="verified-badge" title="Authenticated account identifier">
                            <IconLock />
                            Primary
                          </span>
                        </span>
                      </div>

                      <div className="field-block">
                        <span className="field-label">Phone Number</span>
                        <span className={`field-value ${!user.phone ? 'empty' : ''}`}>
                          {user.phone || 'Not provided'}
                        </span>
                      </div>

                      <div className="field-block">
                        <span className="field-label">Member Since</span>
                        <span className="field-value" suppressHydrationWarning>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent member'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="fields-section">
                    <div className="section-title">Financial Information</div>
                    <div className="fields-grid">
                      <div className="field-block">
                        <span className="field-label">Monthly Income</span>
                        <span className={`field-value ${user.income == null ? 'empty' : ''}`}>
                          {user.income != null ? `${formatCurrency(user.income)} / month` : 'Not specified'}
                        </span>
                        <span className="field-note">Used to match card eligibility and spending bonuses</span>
                      </div>

                      <div className="field-block">
                        <span className="field-label">Employment Type</span>
                        <span className={`field-value ${!employmentLabel ? 'empty' : ''}`}>
                          {employmentLabel || 'Not specified'}
                        </span>
                        <span className="field-note">Helps recommend cards matching your career profile</span>
                      </div>

                      <div className="field-block">
                        <span className="field-label">Permanent Account Number (PAN)</span>
                        <div className={`field-value pan-value ${!user.pan ? 'empty' : ''}`}>
                          {user.pan ? (
                            <>
                              <span className="pan-display">
                                <span className="pan-masked-part">XXXXXX</span>
                                <span className="pan-visible-part">
                                  {user.pan.length >= 5 ? user.pan.slice(user.pan.startsWith('XXXXXX') ? 6 : 5) : user.pan}
                                </span>
                              </span>
                              <span
                                className="security-badge encrypted"
                                title="Encrypted at rest using AES-256-GCM"
                              >
                                <IconLock />
                                Encrypted
                              </span>
                            </>
                          ) : (
                            'Not provided'
                          )}
                        </div>
                        <span className="field-note">
                          <IconShieldCheck />
                          Protected with AES-256-GCM encryption
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode: Form View */
                <form className="edit-form" onSubmit={handleSaveProfile}>
                  <div className="form-fields-grid">
                    <div className="form-field">
                      <label htmlFor="name-input">Full Name *</label>
                      <input
                        id="name-input"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        required
                        className={formErrors.name ? 'has-error' : ''}
                      />
                      {formErrors.name && <span className="field-error-msg">{formErrors.name}</span>}
                    </div>

                    <div className="form-field">
                      <label htmlFor="email-input">
                        Email Address
                        <span className="locked-tag">Locked</span>
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        value={user.email}
                        disabled
                        title="Email is locked to your authenticated identity."
                      />
                      <span className="field-help-text">
                        Tied to your authenticated account credentials.
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="phone-input">Phone Number</label>
                      <input
                        id="phone-input"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className={formErrors.phone ? 'has-error' : ''}
                      />
                      {formErrors.phone && <span className="field-error-msg">{formErrors.phone}</span>}
                    </div>

                    <div className="form-field">
                      <label htmlFor="income-input">Monthly Income (INR)</label>
                      <div className="input-currency-wrapper">
                        <span className="currency-prefix">₹</span>
                        <input
                          id="income-input"
                          type="number"
                          min="0"
                          step="1000"
                          value={formData.income}
                          onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                          placeholder="75000"
                          className={formErrors.income ? 'has-error' : ''}
                        />
                      </div>
                      {formErrors.income ? (
                        <span className="field-error-msg">{formErrors.income}</span>
                      ) : (
                        <span className="field-help-text">
                          Used to optimize rewards, eligibility, and spend goals.
                        </span>
                      )}
                    </div>

                    <div className="form-field full-width">
                      <label htmlFor="employment-select">Employment Type</label>
                      <select
                        id="employment-select"
                        value={formData.employmentType}
                        onChange={(e) =>
                          setFormData({ ...formData, employmentType: e.target.value })
                        }
                      >
                        <option value="">Select employment status...</option>
                        {EMPLOYMENT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field full-width">
                      <label htmlFor="pan-input">
                        Permanent Account Number (PAN)
                        <span className="field-badge-secure">AES-256-GCM Encrypted</span>
                      </label>
                      <input
                        id="pan-input"
                        type="text"
                        maxLength={10}
                        value={formData.pan}
                        onChange={(e) =>
                          setFormData({ ...formData, pan: e.target.value.toUpperCase() })
                        }
                        placeholder="ABCDE1234F"
                        style={{
                          textTransform: 'uppercase',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          letterSpacing: '0.06em',
                          fontWeight: 600,
                        }}
                        className={formErrors.pan ? 'has-error' : ''}
                      />
                      {formErrors.pan ? (
                        <span className="field-error-msg">{formErrors.pan}</span>
                      ) : (
                        <span className="field-help-text">
                          10-character alphanumeric Indian tax ID. Automatically encrypted at rest before saving.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-action-bar">
                    <button
                      type="button"
                      className="btn-control secondary"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="btn-save-profile"
                      className="btn-control primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="btn-spinner" aria-hidden="true" />
                          Saving…
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>

          {/* Sidebar Column: Compact, Unified Container */}
          <aside className="sidebar-column">
            <div className="sidebar-card">
              {/* Section 1: Connected Services */}
              <div className="sidebar-section">
                <h3 className="section-heading">Connected Services</h3>
                <nav className="nav-services-list" aria-label="Connected Services">
                  <Link href="/wallet" className="nav-service-item">
                    <div className="service-icon">
                      <IconCreditCard />
                    </div>
                    <div className="service-details">
                      <span className="service-title">My Credit Cards</span>
                      <span className="service-desc">Manage wallet & card perks</span>
                    </div>
                    <IconChevronRight className="service-chevron" />
                  </Link>


                  <Link href="/settings/consent" className="nav-service-item">
                    <div className="service-icon">
                      <IconShield />
                    </div>
                    <div className="service-details">
                      <span className="service-title">Privacy & Consent</span>
                      <span className="service-desc">Data security & permissions</span>
                    </div>
                    <IconChevronRight className="service-chevron" />
                  </Link>

                  <Link href="/gmail" className="nav-service-item">
                    <div className="service-icon">
                      <IconMail />
                    </div>
                    <div className="service-details">
                      <span className="service-title">Gmail Statement Sync</span>
                      <span className="service-desc">Automated statement parsing</span>
                    </div>
                    <IconChevronRight className="service-chevron" />
                  </Link>
                </nav>
              </div>

              {/* Section 2: Communication Preferences */}
              <div className="sidebar-section">
                <h3 className="section-heading">Communication Preferences</h3>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Product Updates & Tips</span>
                    <p className="toggle-desc">
                      Reward optimization alerts and feature updates.
                    </p>
                  </div>

                  <label className="switch-wrapper">
                    <input
                      type="checkbox"
                      checked={Boolean(user.marketingConsent)}
                      onChange={handleMarketingToggle}
                      disabled={updatingMarketing}
                      aria-label="Toggle product updates"
                    />
                    <span className="switch-slider" />
                  </label>
                </div>
              </div>

              {/* Section 3: Account Session / Sign Out */}
              <div className="sidebar-section session-section">
                <div className="session-info">
                  <span className="session-label">Account Session</span>
                  <span className="session-desc">Signed in as {user.email || 'user'}</span>
                </div>

                <button
                  type="button"
                  id="btn-logout"
                  className="btn-signout"
                  onClick={() => setIsLogoutModalOpen(true)}
                  disabled={loggingOut}
                >
                  <IconRefreshCw />
                  {loggingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => {
          if (!loggingOut) setIsLogoutModalOpen(false)
        }}
        onConfirm={handleConfirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of CardMax?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        isLoading={loggingOut}
      />
    </div>
  )
}
