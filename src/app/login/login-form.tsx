'use client'
import { IconShield, IconGoogle, IconAlertCircle, IconCreditCard } from '@/components/Icons';


import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { sendOtpSchema, verifyOtpSchema } from '@/lib/validation/schemas'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api'
import './login.scss'

type Channel = 'email' | 'phone'
type Step = 'choose' | 'identifier' | 'otp'

type IdentifierForm = { identifier: string }
type OtpForm = { code: string }

const postJson = (
  url: string,
  body: unknown,
): Promise<{ data: Record<string, unknown>; status: number }> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  return fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  }).then(async (res) => ({ status: res.status, data: await res.json().catch(() => ({})) }))
}

export const LoginForm = () => {
  const [step, setStep] = useState<Step>('choose')
  const [channel, setChannel] = useState<Channel | null>(null)
  const [masked, setMasked] = useState('')
  const [expiresIn, setExpiresIn] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [verifying, setVerifying] = useState(false)
  const [sending, setSending] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('error') || ''
  })

  const router = useRouter()

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { register: registerIdentifier, handleSubmit: submitIdentifier } = useForm<IdentifierForm>()
  const {
    register: registerOtp,
    handleSubmit: submitOtp,
    setValue: setOtpValue,
  } = useForm<OtpForm>()

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const beginCountdown = useCallback(
    (resendInSeconds: number) => {
      stopTimer()
      setSecondsLeft(resendInSeconds)
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            stopTimer()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [stopTimer],
  )

  useEffect(() => stopTimer, [stopTimer])

  const requestOtp = async (rawIdentifier: string, silent = false) => {
    if (!silent) setError('')
    setSending(true)

    const parsed = sendOtpSchema.safeParse({ identifier: rawIdentifier })
    if (!parsed.success) {
      setSending(false)
      setError('Enter a valid email address or phone number.')
      return
    }

    const { status, data } = await postJson('/api/users/send-otp', {
      identifier: parsed.data.identifier,
    })
    setSending(false)

    if (status !== 200) {
      setError((data.error as string) || 'Failed to send a code. Please try again.')
      return
    }

    setIdentifier(parsed.data.identifier)
    setChannel(data.channel as Channel)
    setMasked((data.maskedIdentifier as string) || '')
    setExpiresIn((data.expiresInSeconds as number) || 0)
    beginCountdown((data.resendInSeconds as number) || 30)
    setStep('otp')
    setOtpValue('code', '')
  }

  const onSelectChannel = (next: Channel) => {
    setError('')
    setChannel(next)
    setStep('identifier')
  }

  const verifyCode = async ({ code }: OtpForm) => {
    setError('')
    const parsed = verifyOtpSchema.safeParse({ identifier, code })
    if (!parsed.success) {
      setError('Enter the code you received.')
      return
    }

    setVerifying(true)
    const { status, data } = await postJson('/api/users/verify-otp', {
      identifier: parsed.data.identifier,
      code: parsed.data.code,
    })
    setVerifying(false)

    if (status !== 200) {
      setError((data.error as string) || 'The code could not be verified. Please try again.')
      return
    }

    if (data.consentRequired) {
      window.location.assign('/consent-onboarding')
    } else {
      const searchParams = new URLSearchParams(window.location.search)
      const redirectUrl = searchParams.get('redirect')
      const target = redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : (data.profileComplete ? '/' : '/complete-profile')
      window.location.assign(target)
    }
  }

  const handleIdentifierSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void submitIdentifier(({ identifier: id }) => {
      void requestOtp(id)
    })(e)
  }

  return (
    <div className="cm-login-card">
      {/* LEFT SIDE: Navy/Slate Branding Panel */}
      <div className="cm-login-brand-panel">
        <div className="cm-login-brand-top">
          <Link href="/" className="cm-login-logo" aria-label="CardMax Home">
            <div className="cm-login-logo-icon">
              <IconCreditCard />
            </div>
            <span className="cm-login-logo-text">CardMax</span>
          </Link>

          <div className="cm-login-badge-wrap">
            <span className="cm-login-badge">SIGN IN</span>
          </div>

          <div className="cm-login-hero-text">
            <h1>
              Smart cards.
              <br />
              Better rewards.
            </h1>
            <p>Track your cards, understand your rewards, and make every spend count.</p>
          </div>

          <div className="cm-login-features">
            <div className="cm-login-feature-card">
              <div className="cm-feature-num">01</div>
              <div className="cm-feature-content">
                <strong>Track cards and rewards</strong>
                <span>Keep your credit card value organized in one place.</span>
              </div>
            </div>

            <div className="cm-login-feature-card">
              <div className="cm-feature-num">02</div>
              <div className="cm-feature-content">
                <strong>Discover missed value</strong>
                <span>See where the right card could have earned more.</span>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="cm-login-brand-bottom">
          <div className="cm-login-signup-card">
            <span>New to CardMax?</span>
            <button
              type="button"
              className="cm-login-signup-link"
              onClick={() => {
                setError('')
                setStep('choose')
              }}
            >
              Create your account →
            </button>
          </div>
        </div> */}
      </div>

      {/* RIGHT SIDE: White/Light Login Panel */}
      <div className="cm-login-auth-panel">
        <div className="cm-login-auth-content">
          <div className="cm-login-auth-header">
            <span className="cm-login-auth-tag">SIGN IN</span>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your CardMax account.</p>
          </div>

          {error && (
            <div className="cm-login-error" role="alert">
              <IconAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {step === 'choose' && (
            <div className="cm-login-actions">
              <a className="cm-login-btn cm-login-btn--outline" href={`${API_BASE_URL}/api/users/google/login`}>
                <span className="cm-google-icon" aria-hidden="true">
                  <IconGoogle />
                </span>
                <span>Continue with Google</span>
              </a>

              <div className="cm-login-divider">
                <span>or</span>
              </div>

              <button
                type="button"
                className="cm-login-btn cm-login-btn--outline"
                onClick={() => onSelectChannel('email')}
              >
                Continue with Email
              </button>

              <button
                type="button"
                className="cm-login-btn cm-login-btn--outline"
                onClick={() => onSelectChannel('phone')}
              >
                Continue with Phone
              </button>
            </div>
          )}

          {step === 'identifier' && channel && (
            <form className="cm-login-form" onSubmit={handleIdentifierSubmit}>
              <div className="cm-form-group">
                <label className="cm-form-label" htmlFor="identifier">
                  {channel === 'email' ? 'Email address' : 'Phone number'}
                </label>
                <input
                  id="identifier"
                  className="cm-form-input"
                  type={channel === 'email' ? 'email' : 'tel'}
                  placeholder={channel === 'email' ? 'you@example.com' : '+1 555 000 0000'}
                  autoComplete={channel === 'email' ? 'email' : 'tel'}
                  inputMode={channel === 'email' ? 'email' : 'tel'}
                  {...registerIdentifier('identifier')}
                />
              </div>

              <button
                type="submit"
                className="cm-login-btn cm-login-btn--primary"
                disabled={sending}
              >
                {sending ? 'Sending code…' : 'Send code'}
              </button>
              <button
                type="button"
                className="cm-login-btn--link"
                onClick={() => setStep('choose')}
              >
                Back
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form className="cm-login-form" onSubmit={submitOtp(verifyCode)}>
              <p className="cm-form-copy">
                Enter the {expiresIn > 0 ? `code ` : 'code '}sent to <strong>{masked}</strong>.
              </p>
              <div className="cm-form-group">
                <label className="cm-form-label" htmlFor="code">
                  Verification code
                </label>
                <input
                  id="code"
                  className="cm-form-input cm-form-input--otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="······"
                  maxLength={8}
                  {...registerOtp('code')}
                />
              </div>

              <button
                type="submit"
                className="cm-login-btn cm-login-btn--primary"
                disabled={verifying}
              >
                {verifying ? 'Verifying…' : 'Verify and continue'}
              </button>

              <div className="cm-resend-area">
                {secondsLeft > 0 ? (
                  <span>Resend code in {secondsLeft}s</span>
                ) : (
                  <button
                    type="button"
                    className="cm-resend-btn"
                    disabled={sending}
                    onClick={() => requestOtp(identifier, true)}
                  >
                    {sending ? 'Sending…' : 'Resend code'}
                  </button>
                )}
              </div>

              <button
                type="button"
                className="cm-login-btn--link"
                onClick={() => setStep('identifier')}
              >
                Change email or phone
              </button>
            </form>
          )}
        </div>

        <div className="cm-login-auth-footer">
          <div className="cm-security-note">
            <IconShield />
            <span>Secure sign-in • Your information stays protected</span>
          </div>
          <p className="cm-legal-note">
            By continuing, you agree to CardMax's{' '}
            <Link href="/terms-and-conditions">terms</Link> and{' '}
            <Link href="/privacy-and-policy">privacy policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
