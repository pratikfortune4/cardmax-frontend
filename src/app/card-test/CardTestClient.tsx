"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { IconLock, IconChevronRight, IconMail, IconFileText, IconMonitor, IconArrowLeft } from '@/components/Icons';

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
        <button
          className={styles.backButton}
          onClick={() => router.back()}
        >
          <IconArrowLeft width="24" height="24" />
        </button>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>Take the Right Card Test</h1>
        <p className={styles.subtitle}>
          Find out which credit cards fit your spending habits and discover how
          to get more value from your cards.
        </p>

        <div className={styles.heroVisual} aria-hidden="true">
          <div
            className={`${styles.decorativeCircle} ${styles.topRight}`}
          ></div>
          <div
            className={`${styles.decorativeCircle} ${styles.bottomLeft}`}
          ></div>
          <div className={styles.cardMockup}>
            <div className={styles.cardChip}></div>
            <div className={styles.cardLines}>
              <div className={`${styles.cardLine} ${styles.long}`}></div>
              <div className={`${styles.cardLine} ${styles.short}`}></div>
            </div>
          </div>
        </div>

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
              <IconMonitor width="24" height="24" />
            </div>
            <div className={styles.optionContent}>
              <span className={styles.optionTitle}>Enter Expenses</span>
              <span className={styles.optionSubtitle}>
                Based on your spending habits
              </span>
            </div>
            <div className={styles.optionArrow}>
              <IconChevronRight width="20" height="20" />
            </div>
          </button>

          {/* Statements Option */}
          <button
            className={`${styles.optionCard} ${selectedMethod === "statements" ? styles.selected : ""}`}
            onClick={() => handleMethodSelect("statements")}
          >
            <div className={styles.optionIcon}>
              <IconFileText width="24" height="24" />
            </div>
            <div className={styles.optionContent}>
              <span className={styles.optionTitle}>Upload Statements</span>
              <span className={styles.optionSubtitle}>PDF from your bank</span>
            </div>
            <div className={styles.optionArrow}>
              <IconChevronRight width="20" height="20" />
            </div>
          </button>

          {/* Gmail Option */}
          <button
            className={`${styles.optionCard} ${selectedMethod === "gmail" ? styles.selected : ""}`}
            onClick={() => handleMethodSelect("gmail")}
          >
            <div className={styles.optionIcon}>
              <IconMail width="24" height="24" />
            </div>
            <div className={styles.optionContent}>
              <span className={styles.optionTitle}>Scan Gmail</span>
              <span className={styles.optionSubtitle}>Securely & privately</span>
            </div>
            <div className={styles.optionArrow}>
              <IconChevronRight width="20" height="20" />
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
            <IconLock className={styles.securityIcon} width="24" height="24" />
            Your information is safe and secure
          </div>
        </div>
      </div>
    </div>
  );
}