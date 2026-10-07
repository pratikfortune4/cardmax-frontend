"use client";
import { IconArrowLeft, IconLoader } from '@/components/Icons';

import React, { useState, useEffect } from "react";
import "./GmailScanner.scss";

const GMAIL_FETCH_MSGS = [
  "Connecting to your inbox...",
  "Searching the last few months for credit-card statement emails...",
  "Filtering bank senders, ignoring promos and newsletters...",
  "Downloading PDF attachments (often the slowest step)...",
  "Auto-unlocking encrypted statements from the keyring...",
  "Classifying by issuer (HDFC, Axis, SBI, ICICI, IndusInd...)...",
  "Almost there -- finalizing the statement list...",
];

export default function GmailScanner() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Message rotator
  useEffect(() => {
    if (msgIndex >= GMAIL_FETCH_MSGS.length - 1) return;

    const timeout = setTimeout(() => {
      setMsgIndex((prev) => prev + 1);
    }, 4500);

    return () => clearTimeout(timeout);
  }, [msgIndex]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    ((msgIndex + 1) / GMAIL_FETCH_MSGS.length) * 100;

  return (
    <div className="gmail-scanner-card">
      {/* Top Border Accent */}
      <div className="gsc-top-accent-blue" />
      <div className="gsc-top-accent-dark" />

      {/* Header */}
      <div className="gsc-header">
        <div className="gsc-header-left">
          <div className="gsc-dot" />
          <h2 className="gsc-title">
            Gmail connected with your sign-in
          </h2>
        </div>
        <div className="gsc-read-only">
          Read-Only
        </div>
      </div>

      {/* Info Box */}
      <div className="gsc-info-box">
        <p className="gsc-info-title">
          First connect usually takes 2-21 minutes.
        </p>
        <p className="gsc-info-text">
          Gmail's API limits us to one statement at a time, so a bigger wallet or
          a longer window takes proportionally longer. You can leave this tab
          open and come back -- the scan continues server-side.
        </p>
      </div>

      {/* Dynamic Loader Section */}
      <div className="gsc-loader-section">
        <IconArrowLeft width="24" height="24" />
        <div className="gsc-loader-text">
          {GMAIL_FETCH_MSGS[msgIndex]}
        </div>
      </div>

      {/* Footer & Progress */}
      <div className="gsc-footer">
        <div className="gsc-footer-top">
          <span className="gsc-footer-left">
            Scanning Gmail
          </span>
          <span className="gsc-footer-right">
            {formatTime(elapsedSeconds)} Elapsed
          </span>
        </div>
        {/* Progress Bar */}
        <div className="gsc-progress-track">
          <div
            className="gsc-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
