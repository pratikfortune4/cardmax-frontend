"use client";

import React, { useEffect, useState } from "react";
import { AnalysisPeriodSelector } from "@/components/AnalysisPeriodSelector/AnalysisPeriodSelector";
import { GmailScanner } from "@/components/GmailScanner";
import "./SyncStatementsModal.scss";
import { API_BASE_URL } from "@/lib/api";

export interface SyncStatementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (periodMonths: number) => Promise<void>;
  isSyncing: boolean;
  initialPeriod?: number;
}

export const SyncStatementsModal: React.FC<SyncStatementsModalProps> = ({
  isOpen,
  onClose,
  onSync,
  isSyncing,
  initialPeriod = 6,
}) => {
  const [period, setPeriod] = useState(initialPeriod);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSyncing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSyncing, onClose]);

  // Sync preference with backend silently
  const handlePeriodChange = async (val: number) => {
    setPeriod(val);
    try {
      await fetch(`${API_BASE_URL}/api/users/gmail/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period_months: val }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to save sync timeframe preference", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sync-modal-overlay">
      <div
        className="sync-modal-backdrop"
        onClick={() => !isSyncing && onClose()}
        aria-hidden="true"
      />
      <div
        className="sync-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-modal-title"
      >
        <button
          className="sync-modal-close"
          onClick={onClose}
          disabled={isSyncing}
          aria-label="Close dialog"
        >
          ×
        </button>

        <div className="sync-modal-header">
          <h2 id="sync-modal-title">Sync Statements</h2>
          <p>Import your credit card statements securely from Gmail.</p>
        </div>

        {isSyncing ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            <GmailScanner />
          </div>
        ) : (
          <>
            <div className="sync-modal-body">
              <AnalysisPeriodSelector
                value={period}
                onChange={handlePeriodChange}
                disabled={isSyncing}
              />
            </div>

            <div className="sync-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isSyncing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-sync"
                onClick={() => onSync(period)}
                disabled={isSyncing}
              >
                Proceed / Sync
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
