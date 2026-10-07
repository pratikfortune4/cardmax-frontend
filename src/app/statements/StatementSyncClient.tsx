"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import {
  IconArrowLeft,
  IconGoogle,
  IconUpload,
  IconCheck,
  IconLoader,
} from "@/components/Icons";
import { GmailScanner } from "@/components/GmailScanner";
import {
  syncStatements,
  StatementSyncProfile,
  StatementSyncPayload,
} from "@/services/statementSyncService";

const PERIOD_OPTIONS = [3, 6, 9, 12];
const REWARD_GOALS = [
  "Auto (recommended)",
  "Money Back",
  "Bank Portal (SmartBuy / Edge)",
  "Voucher Redemption",
  "Miles & Hotel Points",
];
const BANKS = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Other"];

export function StatementSyncClient() {
  const router = useRouter();

  const [periodMonths, setPeriodMonths] = useState(6);
  const [profile, setProfile] = useState<StatementSyncProfile>({
    annualIncome: "15,00,000",
    employmentType: "Salaried",
    portfolioSize: "Up to 3, engine decides",
    loungeAccess: "Doesn't matter, pure value",
    fullName: "",
    dob: "",
    mobileNumber: "",
    primaryRewardGoals: ["Auto (recommended)"],
    banksUsed: [],
  });

  const [source, setSource] = useState<"gmail" | "upload">("gmail");

  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(
      (f) =>
        f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    setUploadedFiles((prev) => {
      const newFiles = [...prev, ...validFiles];
      return newFiles.slice(0, periodMonths); // Limit to periodMonths
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Timer for loading state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleGoalToggle = (goal: string) => {
    setProfile((prev) => {
      let newGoals = [...prev.primaryRewardGoals];
      if (goal === "Auto (recommended)") {
        newGoals = ["Auto (recommended)"];
      } else {
        newGoals = newGoals.filter((g) => g !== "Auto (recommended)");
        if (newGoals.includes(goal)) {
          newGoals = newGoals.filter((g) => g !== goal);
        } else if (newGoals.length < 2) {
          newGoals.push(goal);
        }
      }
      return { ...prev, primaryRewardGoals: newGoals };
    });
  };

  const handleBankToggle = (bank: string) => {
    setProfile((prev) => {
      const exists = prev.banksUsed.includes(bank);
      const newBanks = exists
        ? prev.banksUsed.filter((b) => b !== bank)
        : [...prev.banksUsed, bank];
      return { ...prev, banksUsed: newBanks };
    });
  };

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedIds(new Set());

    const payload: StatementSyncPayload = {
      periodMonths,
      source,
      profile,
    };

    try {
      const response = await syncStatements(payload);
      if (response.success && response.data) {
        setResults(response.data);
        const allIds = new Set<string>();
        response.data.statements_metadata.forEach((r: any) => allIds.add(r.id));
        setSelectedIds(allIds);

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        throw new Error("Failed to fetch statements");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAnalyze = () => {
    console.log("Analyze clicked", {
      selectedIds: Array.from(selectedIds),
      profile,
    });
    router.push("/dashboard");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IconArrowLeft width="20" height="20" />
        </button>
        <span className={styles.headerTitle}>STATEMENT SYNC</span>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>Sync Statements</h1>
        <p className={styles.subtitle}>
          Pull the latest {periodMonths} months from Gmail in one click, or drop
          PDFs by hand. We combine, average, and optimise your annual portfolio.
        </p>

        {/* PERIOD SECTION */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>ANALYSIS PERIOD</span>
          <div className={styles.tabs}>
            {PERIOD_OPTIONS.map((p) => (
              <div
                key={p}
                className={`${styles.tab} ${periodMonths === p ? styles.active : ""}`}
                onClick={() => setPeriodMonths(p)}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setPeriodMonths(p)}
              >
                {p} Months
              </div>
            ))}
          </div>
          <p className={`${styles.formHelper} ${styles.highlight}`}>
            {periodMonths === 6
              ? "Good: 6 months steady the monthly picture. Periodic spend can still be over- or under-counted."
              : periodMonths === 12
                ? "Best: A full year gives the exact annual spend, wiping out periodic variations."
                : "Okay: Gives a quick snapshot, but might miss annual renewals and periodic spikes."}
          </p>
          <p className={styles.formHelper}>
            Upload your {periodMonths} most-recent PDFs, one per billing cycle.
            We use consecutive recent statements (not a random sample) so the
            averaged annual picture reflects your current spending pattern.
          </p>
        </div>

        {/* PROFILE SECTION */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>UNDERWRITING PROFILE</span>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Annual Income</label>
            <div style={{ position: "relative" }}>
              <span className={styles.inputPrefix}>₹</span>
              <input
                className={styles.formInput}
                style={{ paddingLeft: "32px" }}
                value={profile.annualIncome}
                onChange={(e) =>
                  setProfile({ ...profile, annualIncome: e.target.value })
                }
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>Employment Type</label>
              <select
                className={styles.formSelect}
                value={profile.employmentType}
                onChange={(e) =>
                  setProfile({ ...profile, employmentType: e.target.value })
                }
              >
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>Portfolio Size</label>
              <select
                className={styles.formSelect}
                value={profile.portfolioSize}
                onChange={(e) =>
                  setProfile({ ...profile, portfolioSize: e.target.value })
                }
              >
                <option value="Up to 3, engine decides">
                  Up to 3, engine decides
                </option>
                <option value="1 Card">1 Card</option>
                <option value="2 Cards">2 Cards</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Airport Lounge Access</label>
            <select
              className={styles.formSelect}
              value={profile.loungeAccess}
              onChange={(e) =>
                setProfile({ ...profile, loungeAccess: e.target.value })
              }
            >
              <option value="Doesn't matter, pure value">
                Doesn't matter, pure value
              </option>
              <option value="Domestic required">Domestic required</option>
              <option value="International required">
                International required
              </option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Full Name
              <span className={styles.formHelper} style={{ margin: 0 }}>(optional)</span>
            </label>
            <input
              className={styles.formInput}
              placeholder="As on your card"
              value={profile.fullName}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
            />
            <p className={styles.formHelper}>
              Auto-unlocks your statements. Saved to your account, delete
              anytime.
            </p>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>
              Date of Birth
              <span className={styles.formHelper} style={{ margin: 0 }}>(optional)</span>
            </label>
              <input
                type="date"
                className={styles.formInput}
                value={profile.dob}
                onChange={(e) =>
                  setProfile({ ...profile, dob: e.target.value })
                }
              />
              <p className={styles.formHelper}>
                Enables birthday rewards + statement unlock. Saved to your
                account, delete anytime.
              </p>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>
                Mobile Number
                <span className={styles.formHelper} style={{ margin: 0 }}>(optional)</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                className={styles.formInput}
                placeholder="10-digit mobile"
                value={profile.mobileNumber}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    mobileNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
              <p className={styles.formHelper}>
                For your reports and statement unlock only. No OTP, no
                marketing. Saved to your account, delete anytime.
              </p>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Primary Reward Goal</label>
            <p className={styles.formHelper}>
              Select up to 2 to compare side-by-side.
            </p>
            <div className={styles.multiSelectGrid}>
              {REWARD_GOALS.map((g) => (
                <button
                  key={g}
                  className={`${styles.pillButton} ${profile.primaryRewardGoals.includes(g) ? styles.active : ""}`}
                  onClick={() => handleGoalToggle(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Banks You Already Use
              <span className={`${styles.badge} ${styles.new}`}>NEW</span>
            </label>
            <p className={styles.formHelper}>
              Your own bank approves you more easily. Matching cards carry a
              your-bank badge. It never changes the reward math.
            </p>
            <div className={styles.multiSelectGrid}>
              {BANKS.map((b) => (
                <button
                  key={b}
                  className={`${styles.pillButton} ${profile.banksUsed.includes(b) ? styles.active : ""}`}
                  onClick={() => handleBankToggle(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SOURCE TABS SECTION */}
        <div className={styles.section}>
          <div className={styles.tabs}>
            <div
              className={`${styles.tab} ${source === "gmail" ? styles.active : ""}`}
              onClick={() => setSource("gmail")}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSource("gmail")}
            >
              <IconGoogle width="24" height="24" />
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                Gmail Auto-Sync{" "}
                <span className={`${styles.badge} ${styles.fast}`}>
                  FASTEST
                </span>
              </div>
            </div>
            <div
              className={`${styles.tab} ${source === "upload" ? styles.active : ""}`}
              onClick={() => setSource("upload")}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSource("upload")}
            >
              <IconUpload width="24" height="24" />
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                Upload PDFs <span className={styles.badge}>FULL CONTROL</span>
              </div>
            </div>
          </div>

          {source === "gmail" ? (
            <div>
              <div className={styles.statusText}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#10b981",
                    borderRadius: "50%",
                  }}
                />
                Gmail connected with your sign-in
                <span className={styles.readOnly || "readOnly"}>READ-ONLY</span>
              </div>

              {!loading && !results && (
                <button className={styles.actionButton} onClick={handleFetch}>
                  Fetch Last {periodMonths} Months
                </button>
              )}
            </div>
          ) : (
            <div>
              <div
                className={`${styles.uploadDropZone} ${dragActive ? styles.dragActive : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={styles.uploadIconWrap}>
                  {/* Folder icon */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div className={styles.uploadTextMain}>
                  Drop PDFs here or{" "}
                  <span className={styles.browseLink}>browse</span>
                </div>
                <div className={styles.uploadTextSub}>
                  HDFC · Axis · ICICI · SBI · AMEX · Kotak
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className={styles.uploadedFilesContainer}>
                  <div className={styles.uploadedFilesHeader}>
                    <span>{uploadedFiles.length} FILES ATTACHED</span>
                    <button
                      className={styles.clearAll}
                      onClick={() => setUploadedFiles([])}
                    >
                      Clear all
                    </button>
                  </div>

                  {uploadedFiles.map((file, i) => (
                    <div key={i} className={styles.uploadedFileRow}>
                      <div className={styles.fileIcon}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </div>
                      <div className={styles.fileDetails}>
                        <div className={styles.fileName}>{file.name}</div>
                        <div className={styles.fileSize}>
                          {(file.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                      <button
                        className={styles.removeFile}
                        onClick={() => removeFile(i)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}

                  <div className={styles.uploadProgress}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${(uploadedFiles.length / periodMonths) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className={styles.progressText}>
                      {uploadedFiles.length} / {periodMonths} months
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.howItWorks}>
                <p>
                  <strong>How it works:</strong> All PDFs are parsed together.
                  Transactions are combined and averaged across {periodMonths}{" "}
                  months to produce annualised spend vectors for the VS engine.
                </p>
              </div>

              {!loading && (
                <button
                  className={styles.actionButton}
                  disabled={uploadedFiles.length === 0}
                  onClick={() => console.log("Analyse uploaded files")}
                >
                  Analyse {uploadedFiles.length} Statements →
                </button>
              )}
            </div>
          )}

          {loading && source === "gmail" ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "2rem 0",
              }}
            >
              <GmailScanner />
            </div>
          ) : loading && source === "upload" ? (
            <div className={styles.loadingSection}>
              <IconLoader className={styles.loadingSpinner} />
              <h3 className={styles.loadingTitle}>UPLOADING PDFs</h3>
              <p className={styles.loadingSubtitle}>{formatTime(elapsed)} ELAPSED</p>
              <p className={styles.loadingMessage}>Processing your files...</p>
            </div>
          ) : null}

          {error && (
            <div className={styles.errorAlert}>
              <p className={styles.errorMessage}>{error}</p>
              <button onClick={handleFetch} className={styles.errorRetryBtn}>
                Retry
              </button>
            </div>
          )}
        </div>

        {/* RESULTS SECTION */}
        {results && (
          <div className={styles.resultsSection} ref={resultsRef}>
            <div className={styles.resultsHeader}>
              {results.statement_count} STATEMENT
              {results.statement_count !== 1 ? "S" : ""} FOUND · {periodMonths}{" "}
              MONTH{periodMonths !== 1 ? "S" : ""} ·{" "}
              {results.statements_metadata.length} CARD
              {results.statements_metadata.length !== 1 ? "S" : ""}
            </div>

            <div style={{ marginBottom: "16px" }}>
              {results.statements_metadata.map((r: any) => (
                <div key={r.id} className={styles.resultRow}>
                  <div className={styles.resultRowLeft}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleRow(r.id)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "var(--color-primary, #000)",
                      }}
                    />
                    <span className={styles.resultLabel}>
                      {r.bank_slug} · {r.filename.replace(".pdf", "")}
                    </span>
                  </div>
                  <span
                    className={`${styles.resultStatus} ${r.status === "UNLOCKED" ? styles.unlocked : styles.locked}`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>

            {results.skipped_reason && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  background: "#f1f5f9",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "24px",
                  lineHeight: 1.5,
                }}
              >
                {results.skipped_reason}
              </p>
            )}

            <button
              className={styles.actionButton}
              onClick={handleAnalyze}
              disabled={selectedIds.size === 0}
            >
              Analyse {selectedIds.size} Statement
              {selectedIds.size !== 1 ? "s" : ""} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
