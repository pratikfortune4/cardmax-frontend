"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { IconArrowLeft, IconSearch, IconX } from "@/components/Icons";
import { SPEND_VECTORS } from "@/config/spendVectors";
import {
  StatementSyncProfile,
  submitManualSpends,
} from "@/services/statementSyncService";

const BANKS = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Other"];

export function ManualSpendClient() {
  const router = useRouter();

  const [profile, setProfile] = useState<StatementSyncProfile>({
    monthlySpend: "",
    fdSpend: "",
    portfolioSize: "Up to 3, engine decides",
    banksUsed: [],
  });

  const [vectorValues, setVectorValues] = useState<Record<string, number>>({});

  // Cards held functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    monthlySpend?: string;
    fdSpend?: string;
    mobile?: string;
  }>({});

  const toggleBank = (bank: string) => {
    setProfile((prev) => {
      const isSelected = prev.banksUsed.includes(bank);
      return {
        ...prev,
        banksUsed: isSelected
          ? prev.banksUsed.filter((b) => b !== bank)
          : [...prev.banksUsed, bank],
      };
    });
  };

  const handleVectorChange = (id: string, valStr: string) => {
    const rawVal = valStr.replace(/\D/g, "");
    let numVal = parseInt(rawVal, 10);
    if (isNaN(numVal)) numVal = 0;

    const vectorDef = SPEND_VECTORS.find((v) => v.id === id);
    if (vectorDef && numVal > vectorDef.max) {
      numVal = vectorDef.max;
    }

    setVectorValues((prev) => ({
      ...prev,
      [id]: numVal,
    }));
  };

  const totalMonthlySpend = Object.values(vectorValues).reduce(
    (sum, val) => sum + val,
    0,
  );
  const yearlySpend = totalMonthlySpend * 12;
  const activeVectorCount = Object.values(vectorValues).filter(
    (val) => val > 0,
  ).length;

  const handleSubmit = async () => {
    // Validate
    const newErrors: {
      monthlySpend?: string;
      fdSpend?: string;
      mobile?: string;
    } = {};
    if (!profile.monthlySpend) {
      newErrors.monthlySpend = "Monthly spend is required";
    }
    if (!profile.fdSpend) {
      newErrors.fdSpend = "FD spend is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await submitManualSpends({
        profile,
        vectorValues,
        selectedCards,
      });
      console.log("Response:", response);
      router.push("/dashboard"); // or results route
    } catch (e) {
      console.error(e);
      setErrors({
        ...errors,
        monthlySpend: "Failed to submit. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <IconArrowLeft width="20" height="20" />
          </button>
        </div>
        <span
          className={styles.headerTitle}
          style={{ color: "var(--color-text-muted)" }}
        >
          CARDMAX
        </span>
      </div>

      <div className={styles.content}>
        {/* PROFILE */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>EXPENSES</span>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>
                What is your approximate monthly spend?
              </label>
              <div style={{ position: "relative", marginTop: "8px" }}>
                <span className={styles.inputPrefix}>₹</span>
                <input
                  className={`${styles.formInput} ${errors.monthlySpend ? styles.inputError : ""}`}
                  style={{ paddingLeft: "32px" }}
                  value={profile.monthlySpend}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val) {
                      val = parseInt(val, 10).toLocaleString("en-IN");
                    }
                    setProfile({ ...profile, monthlySpend: val });
                  }}
                  placeholder="e.g. 50,000"
                />
              </div>
              {errors.monthlySpend ? (
                <p className={styles.errorText}>{errors.monthlySpend}</p>
              ) : (
                <p className={styles.formHelper}>
                  This helps us estimate your potential rewards and savings.
                </p>
              )}
            </div>

            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>
                How much do you want to spend on FD ?
              </label>
              <div style={{ position: "relative", marginTop: "8px" }}>
                <span className={styles.inputPrefix}>₹</span>
                <input
                  className={`${styles.formInput} ${errors.fdSpend ? styles.inputError : ""}`}
                  style={{ paddingLeft: "32px" }}
                  value={profile.fdSpend}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val) {
                      val = parseInt(val, 10).toLocaleString("en-IN");
                    }
                    setProfile({ ...profile, fdSpend: val });
                  }}
                  placeholder="e.g. 1,00,000"
                />
              </div>
              {errors.fdSpend ? (
                <p className={styles.errorText}>{errors.fdSpend}</p>
              ) : (
                <p className={styles.formHelper}>
                  This helps us estimate your potential rewards and savings.
                </p>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Portfolio Size</label>
            <p className={styles.formHelper}>
              Engine enumerates sizes 1...3 and returns one portfolio per size,
              you'll see the 3-card view.
            </p>

            <div className={styles.radioGrid}>
              {[
                {
                  val: "1 Card",
                  title: "1 card",
                  desc: "Single best card for me",
                },
                { val: "2 Cards", title: "2 cards", desc: "Best 2-card combo" },
                { val: "3 Cards", title: "3 cards", desc: "Best 3-card combo" },
                {
                  val: "Up to 3, engine decides",
                  title: "Up to 3",
                  desc: "Let the engine decide",
                },
              ].map((opt) => (
                <button
                  key={opt.val}
                  className={`${styles.radioCard} ${profile.portfolioSize === opt.val ? styles.active : ""}`}
                  onClick={() =>
                    setProfile({ ...profile, portfolioSize: opt.val })
                  }
                >
                  <div className={styles.radioDot} />
                  <div className={styles.radioContent}>
                    <div className={styles.radioTitle}>{opt.title}</div>
                    <div className={styles.radioDesc}>{opt.desc}</div>
                  </div>
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
              Your own bank approves you more easily, matching cards carry a
              your-bank badge. Never changes the reward math.
            </p>
            <div className={styles.multiSelectGrid}>
              {BANKS.map((b) => (
                <button
                  key={b}
                  className={`${styles.pillButton} ${profile.banksUsed.includes(b) ? styles.active : ""}`}
                  onClick={() => toggleBank(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* MONTHLY SPEND VECTORS */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>MONTHLY SPEND VECTORS</span>
            <p className={styles.sectionHelper}>
              Power users: type an exact figure in the box. Sliders update in
              sync. Every extra vector you fill sharpens the recommendation.
            </p>
          </div>

          {/* VECTORS RENDER */}
          <div className={styles.vectorsGrid}>
            {SPEND_VECTORS.map((vector) => (
              <VectorCard
                key={vector.id}
                vector={vector}
                val={vectorValues[vector.id] || 0}
                onChange={handleVectorChange}
                styles={styles}
              />
            ))}
          </div>
        </div>

        {/* CARDS & REWARD GOAL */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>
              CARDS YOU CURRENTLY HOLD
            </span>
            <p className={styles.sectionHelper}>
              Used to compute current portfolio yield, savings gap, and
              reinstate held cards into the recommendation pool. Optional, leave
              empty if none.
            </p>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.searchInputWrap}>
              <IconSearch
                className={styles.searchIcon}
                width="16"
                height="16"
              />
              <input
                className={styles.formInput}
                style={{ paddingLeft: "36px" }}
                placeholder="Search by card name or bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.selectionCount}>
              {selectedCards.length} / 8 selected
            </div>
            {/* Display selected cards here if any */}
            {selectedCards.length > 0 && (
              <div className={styles.selectedCardsList}>
                {selectedCards.map((card) => (
                  <div key={card} className={styles.selectedCardPill}>
                    {card}
                    <button
                      onClick={() =>
                        setSelectedCards((prev) =>
                          prev.filter((c) => c !== card),
                        )
                      }
                    >
                      <IconX width="12" height="12" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.stickyFooter}>
            <div className={styles.footerTotals}>
              <div className={styles.footerLabel}>TOTAL MONTHLY SPEND</div>
              <div className={styles.footerBigTotal}>
                ₹{totalMonthlySpend.toLocaleString("en-IN")}
              </div>
              <div className={styles.footerSubTotal}>
                ₹{yearlySpend.toLocaleString("en-IN")} /yr · {activeVectorCount}{" "}
                active vector
                {activeVectorCount !== 1 ? "s" : ""}
              </div>
            </div>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={totalMonthlySpend === 0 || loading}
            >
              {loading ? "Generating..." : "Generate MaxYield Matrix →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VectorCard({
  vector,
  val,
  onChange,
  styles,
}: {
  vector: any;
  val: number;
  onChange: (id: string, val: string) => void;
  styles: any;
}) {
  return (
    <div className={styles.vectorCard}>
      <div className={styles.vectorHeader}>
        <div className={styles.vectorInfo}>
          <div className={styles.vectorLabel}>
            {vector.id === "flights" || vector.id === "hotels" ? "↳ " : ""}
            {vector.label}
          </div>
          <div className={styles.vectorDesc}>{vector.description}</div>
        </div>
        <div className={styles.vectorInputWrap}>
          <span className={styles.inputPrefixSmall}>₹</span>
          <input
            className={styles.vectorInput}
            value={val === 0 ? "" : val.toLocaleString("en-IN")}
            onChange={(e) => onChange(vector.id, e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className={styles.vectorSliderWrap}>
        <input
          type="range"
          min="0"
          max={vector.max}
          step="500"
          value={val}
          onChange={(e) => onChange(vector.id, e.target.value)}
          className={styles.vectorSlider}
        />
        <div className={styles.vectorBounds}>
          <span>₹0</span>
          <span>₹{vector.max.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
