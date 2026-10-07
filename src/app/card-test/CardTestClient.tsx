"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { IconUpload, IconSliders, IconArrowLeft } from "@/components/Icons";
import Link from "next/link";

export function CardTestClient() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<
    "statements" | "expenses" | null
  >(null);

  const handleMethodSelect = (method: "statements" | "expenses") => {
    setSelectedMethod(method);
    if (method === "statements") {
      router.push("/statements");
    } else if (method === "expenses") {
      router.push("/manual");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.topNav}>
        <Link href="/" className="btn-back">
          <IconArrowLeft className={styles.logoText} />
          <span className={styles.navRightText}> Back to Dashboard</span>
        </Link>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>Drop a statement.</h1>
        <p className={styles.subtitle}>
          Every card in India is priced against your real spending, alone and in
          combos of three. Net rupees after every fee, cap and surcharge.
        </p>

        <div className={styles.optionsList}>
          {/* Option A */}
          <button
            className={`${styles.optionCard} ${selectedMethod === "statements" ? styles.selected : ""}`}
            onClick={() => handleMethodSelect("statements")}
          >
            <div className={styles.fastestBadge}>FASTEST</div>
            <div className={styles.optionContent}>
              <div className={styles.optionIconWrap}>
                <IconUpload width="20" height="20" />
              </div>
              <span className={styles.optionTitle}>
                Run it on my statements
              </span>
              <span className={styles.optionSubtitle}>
                Sync from Gmail in one click or drop bank PDFs. Locked files
                unlock themselves. 3, 6 or 12 months.
              </span>
              <span className={styles.optionLink}>The real thing &rarr;</span>
            </div>
          </button>

          {/* Option B */}
          <button
            className={`${styles.optionCard} ${selectedMethod === "expenses" ? styles.selected : ""}`}
            onClick={() => handleMethodSelect("expenses")}
          >
            <div className={styles.optionContent}>
              <div className={styles.optionIconWrap}>
                <IconSliders width="20" height="20" />
              </div>
              <span className={styles.optionTitle}>Feed my spends by hand</span>
              <span className={styles.optionSubtitle}>
                No statement handy, or new to credit? Declare monthly spends
                across every category. Full control.
              </span>
              <span className={styles.optionLink}>Power user mode &rarr;</span>
            </div>
          </button>
        </div>

        <div className={styles.footerText}>
          Your statement is deleted after analysis &middot; Data stays in India
          &middot; We never store your full card number
        </div>
      </div>
    </div>
  );
}
