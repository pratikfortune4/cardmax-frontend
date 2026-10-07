"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import {
  IconLock,
  IconGoogle,
  IconUpload,
  IconMonitor,
  IconArrowLeft,
} from "@/components/Icons";

type TestMethod = "expenses" | "statements" | "gmail";

export function CardTestClient() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<TestMethod | null>(null);

  const handleMethodSelect = (method: TestMethod) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    switch (selectedMethod) {
      case "expenses":
        // TODO: connect to future expense journey
        console.log("Navigate to expenses journey");
        break;
      case "statements":
        // TODO: connect to future statement journey
        console.log("Navigate to statements journey");
        break;
      case "gmail":
        // TODO: connect to future Gmail journey
        console.log("Navigate to gmail journey");
        break;
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
        <h1 className={styles.title}>Take the Right Card Test</h1>
        <p className={styles.subtitle}>
          Find out which credit cards fit your spending habits and discover how
          to get more value from your cards.
        </p>

        <h2 className={styles.optionsTitle}>
          How would you like to get started?
        </h2>

        <div className={styles.optionsList}>
          {/* Expenses Option */}
          <button
            className={`${styles.optionCard} ${selectedMethod === "expenses" ? styles.selected : ""}`}
            onClick={() => handleMethodSelect("expenses")}
          >
            <div className={styles.optionIcon}>
              <IconMonitor width="20" height="20" />
            </div>
            <div className={styles.optionContent}>
              <span className={styles.optionTitle}>Enter Expenses</span>
              <span className={styles.optionSubtitle}>
                Based on your spending habits
              </span>
            </div>
          </button>

          {/* Statements Option */}
          <button
            className={`${styles.optionCard} ${selectedMethod === "statements" ? styles.selected : ""}`}
            onClick={() => handleMethodSelect("statements")}
          >
            <div className={styles.optionIcon}>
              <IconUpload width="20" height="20" />
            </div>
            <div className={styles.optionContent}>
              <span className={styles.optionTitle}>Upload Statements</span>
              <span className={styles.optionSubtitle}>PDF from your bank</span>
            </div>
          </button>

          {/* Gmail Option */}
          <button
            className={`${styles.optionCard} ${selectedMethod === "gmail" ? styles.selected : ""}`}
            onClick={() => handleMethodSelect("gmail")}
          >
            <div className={styles.optionIcon}>
              <IconGoogle width="20" height="20" />
            </div>
            <div className={styles.optionContent}>
              <span className={styles.optionTitle}>Scan Gmail</span>
              <span className={styles.optionSubtitle}>
                Securely & privately
              </span>
            </div>
          </button>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.continueButton}
            onClick={handleContinue}
            disabled={!selectedMethod}
          >
            Continue
          </button>

          <div className={styles.securityText}>
            <IconLock className={styles.securityIcon} width="14" height="14" />
            Your information is safe and secure
          </div>
        </div>
      </div>
    </div>
  );
}
