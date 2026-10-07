"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import {
  IconLock,
  IconArrowLeft,
} from "@/components/Icons";

export function CardTestClient() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<"statements" | "expenses" | null>(null);

  const handleMethodSelect = (method: "statements" | "expenses") => {
    setSelectedMethod(method);
    if (method === "statements") {
      router.push("/statements");
    } else {
      console.log("Navigate to expenses journey");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IconArrowLeft width="20" height="20" />
        </button>
      </div>

      <div className={styles.content}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
          <span style={{ background: "rgba(0, 0, 0, 0.05)", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>
            240 cards priced live
          </span>
        </div>
        <h1 className={styles.title}>
          Drop a statement.<br />
          The market fights for it.
        </h1>
        <p className={styles.subtitle}>
          Every card in India is priced against your real spending, alone and in combos of three. Net rupees after every fee, cap and surcharge.
        </p>

        <div className={styles.optionsList} style={{ flexDirection: "column" }}>
          {/* Option A */}
          <button
            className={`${styles.optionCard} ${selectedMethod === "statements" ? styles.selected : ""}`}
            onClick={() => handleMethodSelect("statements")}
            style={{ textAlign: "left", alignItems: "flex-start" }}
          >
            <div className={styles.optionContent} style={{ alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className={styles.optionTitle}>Run it on my statements</span>
                <span style={{ background: "#4ade80", color: "#064e3b", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>
                  FASTEST
                </span>
              </div>
              <span className={styles.optionSubtitle} style={{ marginTop: "4px", marginBottom: "8px" }}>
                Sync from Gmail in one click or drop bank PDFs. Locked files unlock themselves. 3, 6 or 12 months.
              </span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-primary, #000)" }}>
                The real thing →
              </span>
            </div>
          </button>

          {/* Option B */}
          <button
            className={`${styles.optionCard} ${selectedMethod === "expenses" ? styles.selected : ""}`}
            onClick={() => handleMethodSelect("expenses")}
            style={{ textAlign: "left", alignItems: "flex-start" }}
          >
            <div className={styles.optionContent} style={{ alignItems: "flex-start" }}>
              <span className={styles.optionTitle}>Feed my spends by hand</span>
              <span className={styles.optionSubtitle} style={{ marginTop: "4px", marginBottom: "8px" }}>
                No statement handy, or new to credit? Declare monthly spends across every category. Full control.
              </span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-primary, #000)" }}>
                Power user mode →
              </span>
            </div>
          </button>
        </div>

        <div className={styles.actions}>
          <div className={styles.securityText}>
            <IconLock className={styles.securityIcon} width="14" height="14" />
            Your information is safe and secure
          </div>
        </div>
      </div>
    </div>
  );
}
