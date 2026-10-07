'use client'
import { IconAlertTriangle, IconArrowLeft, IconGoogle, IconMail, IconRefreshCw } from '@/components/Icons';


import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api'
import { ConfirmationModal } from '@/components/Confirmation/ConfirmationModal'
import { AnalysisPeriodSelector } from '@/components/AnalysisPeriodSelector/AnalysisPeriodSelector'
import { GmailScanner } from '@/components/GmailScanner'
import './gmail-consent.scss'

interface GmailStatus {
  connected: boolean
  gmailAddress?: string
  connectedAt?: string
  scopes?: string
  statementFetchMonths?: number
}

interface SyncResult {
  ok?: boolean
  processed?: number
  totalFound?: number
  message?: string
  error?: string
  code?: string
  results?: Array<{
    issuer: string
    filename: string
    size: number
    status: 'parsed' | 'error'
    error?: string
  }>
}

export const GmailForm = () => {
  const [status, setStatus] = useState<GmailStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [analysisPeriod, setAnalysisPeriod] = useState<number>(6)
  const [disconnecting, setDisconnecting] = useState(false)
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false)
  const [error, setError] = useState(() => {
    if (typeof window === 'undefined') return ''
    const queryError = new URLSearchParams(window.location.search).get('error')
    return queryError ? decodeURIComponent(queryError) : ''
  })
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/gmail/status`, {
        credentials: 'include',
      })
      const data = await res.json()
      setStatus(data)
      if (data.statementFetchMonths) {
        setAnalysisPeriod(data.statementFetchMonths)
      }
    } catch {
      setError('Could not load your Gmail connection status.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch(`${API_BASE_URL}/api/users/gmail/status`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setStatus(data)
          if (data.statementFetchMonths) {
            setAnalysisPeriod(data.statementFetchMonths)
          }
        }
      })
      .catch(() => {
        if (active) setError('Could not load your Gmail connection status.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleConfirmDisconnect = async () => {
    setDisconnecting(true)
    setError('')
    setSyncResult(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/gmail/disconnect`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not disconnect Gmail.')
      } else {
        setStatus({ connected: false })
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setDisconnecting(false)
      setIsDisconnectModalOpen(false)
    }
  }

  const handleSyncStatements = async () => {
    setSyncing(true)
    setError('')
    setSyncResult(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/gmail/sync-statements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_months: analysisPeriod }),
        credentials: 'include',
      })
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Failed to sync statements.')
      } else {
        setSyncResult({
          ok: true,
          processed: data.data.statement_count,
          totalFound: data.data.message_count,
          results: data.data.statements_metadata
            ?.filter((meta: any) => meta.included)
            .map((meta: any) => ({
              issuer: meta.bank_slug || meta.sender_domain,
              filename: meta.filename,
              size: meta.size_bytes,
              status: 'parsed',
              error: null
            }))
        })
      }
      void loadStatus()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  const [connecting, setConnecting] = useState(false)
  const [persistDerived, setPersistDerived] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/gmail/initiate-consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ persistDerived }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || 'Could not initiate Gmail authorization. Please try again.')
        setConnecting(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
      setConnecting(false)
    }
  }

  return (
    <div className="gmail-container">
      {/* Breadcrumb */}
      <div className="gmail-breadcrumb">
        <Link href="/" className="btn-back">
          <IconArrowLeft width="14" height="14" />
          Back to Dashboard
        </Link>
      </div>

      <div className="gmail-card">
        <div className="card-top-header">
          <div className="header-icon-box">
            <IconMail width="22" height="22" />
          </div>
          <h1>Gmail Statement Sync</h1>
          <p>
            Connect your Gmail so CardMax can securely discover your monthly credit card statements
            and optimize your rewards.
          </p>
        </div>

        {error && (
          <div className="gmail-alert error" role="alert">
            <IconAlertTriangle width="15" height="15" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="gmail-loading">
            <span className="loading-spinner" />
            <p>Loading Gmail connection status…</p>
          </div>
        ) : status?.connected ? (
          <div className="connected-view">
            <div className="status-banner">
              <div className="status-info">
                <span className="badge badge-active">
                  <span className="dot" />
                  Connected
                </span>
                <h2>{status.gmailAddress || 'Your Gmail Account'}</h2>
                {status.connectedAt && (
                  <span className="meta-text">
                    Active since{' '}
                    {new Date(status.connectedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>

            {syncing ? (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                <GmailScanner />
              </div>
            ) : (
              <div className="action-box">
                <AnalysisPeriodSelector 
                  value={analysisPeriod} 
                  onChange={async (val) => {
                    setAnalysisPeriod(val);
                    try {
                      await fetch(`${API_BASE_URL}/api/users/gmail/settings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ period_months: val }),
                        credentials: 'include',
                      });
                    } catch (err) {
                      console.error('Failed to save settings:', err);
                    }
                  }}
                  disabled={syncing} 
                />
                
                <button
                  type="button"
                  className="btn-sync"
                  onClick={handleSyncStatements}
                  disabled={syncing}
                >
                  <IconRefreshCw width="15" height="15" />
                  Import Statements Now
                </button>
                <span className="helper-text">
                  CardMax performs a read-only scan for statement PDFs from supported Indian credit
                  card issuers.
                </span>
              </div>
            )}

            {syncResult && (
              <div className="ingest-results-card">
                {syncResult.error ? (
                  <div className="results-error">{syncResult.error}</div>
                ) : (
                  <>
                    <div className="results-summary">
                      {syncResult.message ||
                        `Processed ${syncResult.processed || 0} statement(s).`}
                    </div>
                    {syncResult.results && syncResult.results.length > 0 && (
                      <ul className="results-list">
                        {syncResult.results.map((r, i) => (
                          <li key={i} className={`result-item ${r.status}`}>
                            <span className="result-status-tag">{r.status}</span>
                            <span className="result-filename">{r.filename}</span>
                            <span className="result-issuer">({r.issuer})</span>
                            {r.error && <span className="result-err"> — {r.error}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="disconnect-row">
              <button
                type="button"
                className="btn-disconnect"
                onClick={() => setIsDisconnectModalOpen(true)}
                disabled={disconnecting}
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect Gmail Account'}
              </button>
            </div>
          </div>
        ) : (
          <div className="disconnected-view">
            <p className="notice-lead">
              Before connecting, here is exactly what CardMax will and will not do with your Gmail:
            </p>

            {/* Required Permission */}
            <div className="consent-block required">
              <div className="block-header">
                <h3>Read-only Statement Discovery</h3>
                <span className="badge badge-required">Required</span>
              </div>
              <p>
                We search your mailbox strictly for emails with attached PDF credit card statements
                (HDFC, ICICI, Axis, SBI, Amex, etc.). We <strong>never</strong> read personal
                emails, and <strong>never</strong> send, modify, or delete anything in your mailbox.
              </p>
            </div>

            {/* Optional Permission */}
            <div className="consent-block optional">
              <div className="block-header">
                <h3>Store Derived Financial Summaries</h3>
                <span className="badge badge-optional">Optional</span>
              </div>
              <p>
                Save extracted statement metadata (billing cycle dates, statement amounts due) to
                track spending trends over time.
              </p>
              <div className="checkbox-row">
                <input
                  id="persistDerived"
                  type="checkbox"
                  checked={persistDerived}
                  onChange={(e) => setPersistDerived(e.target.checked)}
                />
                <label htmlFor="persistDerived" className="checkbox-label">
                  Save statement financial summaries in my CardMax account
                </label>
              </div>
            </div>

            <p className="privacy-assurance">
              You can disconnect your Gmail account and revoke access at any time from your Privacy
              & Consent Settings.
            </p>

            <button
              type="button"
              className="btn-google-connect"
              onClick={handleConnect}
              disabled={connecting}
            >
              <IconGoogle width="18" height="18" />
              {connecting ? 'Connecting to Google…' : 'Confirm & Connect with Google'}
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDisconnectModalOpen}
        onClose={() => {
          if (!disconnecting) setIsDisconnectModalOpen(false)
        }}
        onConfirm={handleConfirmDisconnect}
        title="Disconnect Gmail"
        message="Are you sure you want to disconnect Gmail? CardMax will no longer be able to read your statements."
        confirmText="Disconnect Gmail"
        cancelText="Cancel"
        variant="danger"
        isLoading={disconnecting}
      />
    </div>
  )
}
