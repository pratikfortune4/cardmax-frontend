"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { IconArrowLeft, IconSearch, IconX } from "@/components/Icons";
import { SPEND_VECTORS, SpendTab } from "@/config/spendVectors";
import {
  StatementSyncProfile,
  submitManualSpends,
} from "@/services/statementSyncService";

const REWARD_GOALS = [
  "Auto (recommended)",
  "Money Back",
  "Bank Portal (SmartBuy / Edge)",
  "Voucher Redemption",
  "Miles & Hotel Points",
];
const BANKS = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Other"];
const TABS: SpendTab[] = [
  "Everyday spends",
  "Apps & Ecosystems",
  "Rent, Tax & Other",
];

export function ManualSpendClient() {
  const router = useRouter();

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

  const [fuelPreference, setFuelPreference] = useState("I'm not sure / varies");
  const [activeTab, setActiveTab] = useState<SpendTab>("Everyday spends");
  const [vectorValues, setVectorValues] = useState<Record<string, number>>({});

  // Cards held functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ income?: string; mobile?: string }>(
    {},
  );

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

  const toggleRewardGoal = (goal: string) => {
    setProfile((prev) => {
      if (goal === "Auto (recommended)") {
        return { ...prev, primaryRewardGoals: [goal] };
      }
      let newGoals = prev.primaryRewardGoals.filter(
        (g) => g !== "Auto (recommended)",
      );
      const isSelected = newGoals.includes(goal);

      if (isSelected) {
        newGoals = newGoals.filter((g) => g !== goal);
      } else {
        if (newGoals.length < 2) {
          newGoals.push(goal);
        } else {
          newGoals = [newGoals[1], goal]; // Keep latest 2
        }
      }

      if (newGoals.length === 0) {
        newGoals = ["Auto (recommended)"];
      }
      return { ...prev, primaryRewardGoals: newGoals };
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

  const getTabCount = (tab: SpendTab) => {
    return SPEND_VECTORS.filter(
      (v) => v.tab === tab && (vectorValues[v.id] || 0) > 0,
    ).length;
  };

  const handleSubmit = async () => {
    // Validate
    const newErrors: { income?: string; mobile?: string } = {};
    const incomeNum = parseInt(
      profile.annualIncome.replace(/\D/g, "") || "0",
      10,
    );
    if (incomeNum <= 0) {
      newErrors.income = "Annual income is required";
    }
    if (profile.mobileNumber && profile.mobileNumber.length !== 10) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
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
        fuelPreference,
        vectorValues,
        selectedCards,
      });
      console.log("Response:", response);
      router.push("/dashboard"); // or results route
    } catch (e) {
      console.error(e);
      setErrors({ ...errors, income: "Failed to submit. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Grouping vectors for current tab
  const currentTabVectors = SPEND_VECTORS.filter((v) => v.tab === activeTab);
  const groups = Array.from(new Set(currentTabVectors.map((v) => v.group)));

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
          MAXYIELD MATRIX SETUP
        </span>
      </div>

      <div className={styles.content}>
        {/* UNDERWRITING PROFILE */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>UNDERWRITING PROFILE</span>
            <p className={styles.sectionHelper}>
              Used to filter ineligible cards and enforce employment compliance
            </p>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>Annual Income</label>
              <div style={{ position: "relative" }}>
                <span className={styles.inputPrefix}>₹</span>
                <input
                  className={`${styles.formInput} ${errors.income ? styles.inputError : ""}`}
                  style={{ paddingLeft: "32px" }}
                  value={profile.annualIncome}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val) {
                      val = parseInt(val, 10).toLocaleString("en-IN");
                    }
                    setProfile({ ...profile, annualIncome: val });
                  }}
                />
              </div>
              {errors.income ? (
                <p className={styles.errorText}>{errors.income}</p>
              ) : (
                <p className={styles.formHelper}>
                  {profile.annualIncome
                    ? `₹${(parseInt(profile.annualIncome.replace(/\D/g, ""), 10) / 100000).toFixed(1).replace(".0", "")} LPA`
                    : "0 LPA"}
                </p>
              )}
            </div>

            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>
                Full Name{" "}
                <span className={styles.formHelper} style={{ margin: 0 }}>
                  (optional)
                </span>
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
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>
                Date of Birth{" "}
                <span className={styles.formHelper} style={{ margin: 0 }}>
                  (optional)
                </span>
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
                Enables birthday rewards, age-based eligibility + statement
                unlock.
              </p>
            </div>

            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>
                Mobile Number{" "}
                <span className={styles.formHelper} style={{ margin: 0 }}>
                  (optional)
                </span>
              </label>
              <input
                type="tel"
                maxLength={10}
                className={`${styles.formInput} ${errors.mobile ? styles.inputError : ""}`}
                placeholder="10-digit mobile"
                value={profile.mobileNumber}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    mobileNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
              {errors.mobile ? (
                <p className={styles.errorText}>{errors.mobile}</p>
              ) : (
                <p className={styles.formHelper}>
                  For your reports and statement unlock only. No OTP, no
                  marketing. Saved to your account, delete anytime.
                </p>
              )}
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
              <p className={styles.formHelper}>
                Business/corporate cards will be excluded
              </p>
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
        </div>

        {/* FUEL BRAND */}
        <div className={styles.section}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Fuel Brand Preference</label>
            <p className={styles.formHelper}>
              Fuel co-brand cards earn their big rates only at their own
              company's pumps, telling us yours makes that math exact.
            </p>
            <select
              className={styles.formSelect}
              value={fuelPreference}
              onChange={(e) => setFuelPreference(e.target.value)}
            >
              <option value="I'm not sure / varies">
                I'm not sure / varies
              </option>
              <option value="HPCL">HPCL</option>
              <option value="IOCL">IOCL</option>
              <option value="BPCL">BPCL</option>
            </select>
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

          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <div
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {tab}
                  <span className={`${styles.badge} ${styles.countBadge}`}>
                    {getTabCount(tab)} set
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* VECTORS RENDER */}
          <div className={styles.vectorsGrid}>
            {activeTab === "Everyday spends" ? (
              <>
                <div className={styles.vectorColumn}>
                  {[
                    "ONLINE & TRAVEL",
                    "OPTIONAL: SPLIT YOUR TRAVEL FOR SHARPER MATH",
                  ].map((group) => {
                    const vectors = currentTabVectors.filter(
                      (v) => v.group === group,
                    );
                    if (vectors.length === 0) return null;
                    return (
                      <div
                        key={group}
                        className={styles.vectorGroup}
                        style={{ marginBottom: "24px" }}
                      >
                        <div className={styles.vectorGroupLabel}>{group}</div>
                        <div className={styles.vectorsList}>
                          {vectors.map((vector) => (
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
                    );
                  })}
                </div>
                <div className={styles.vectorColumn}>
                  {["OFFLINE, FUEL & UPI"].map((group) => {
                    const vectors = currentTabVectors.filter(
                      (v) => v.group === group,
                    );
                    if (vectors.length === 0) return null;
                    return (
                      <div
                        key={group}
                        className={styles.vectorGroup}
                        style={{ marginBottom: "24px" }}
                      >
                        <div className={styles.vectorGroupLabel}>{group}</div>
                        <div className={styles.vectorsList}>
                          {vectors.map((vector) => (
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
                    );
                  })}
                </div>
              </>
            ) : (
              groups.map((group) => {
                const vectors = currentTabVectors.filter(
                  (v) => v.group === group,
                );
                return (
                  <div key={group} className={styles.vectorGroup}>
                    <div className={styles.vectorGroupLabel}>{group}</div>
                    <div className={styles.vectorsList}>
                      {vectors.map((vector) => (
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
                );
              })
            )}
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

          <div className={styles.sectionHeader} style={{ marginTop: "32px" }}>
            <span className={styles.sectionLabel}>REWARD GOAL (OPTIONAL)</span>
            <p className={styles.sectionHelper}>
              Auto picks the best 1-3 card combo for your spend and income.
              Change it only if you want a specific redemption style.
            </p>
          </div>

          <div className={styles.formGroup}>
            <div
              className={styles.multiSelectGrid}
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              }}
            >
              {REWARD_GOALS.map((g) => (
                <button
                  key={g}
                  className={`${styles.pillButton} ${profile.primaryRewardGoals.includes(g) ? styles.active : ""}`}
                  onClick={() => toggleRewardGoal(g)}
                >
                  {g}
                </button>
              ))}
            </div>
            <p className={styles.formHelper} style={{ marginTop: "8px" }}>
              Auto ranks every card by its guaranteed redemption value. Money
              Back covers statement cashback, statement credit and co-brand
              wallet money.
            </p>

            <div className={styles.stickyFooter}>
              <div className={styles.footerTotals}>
                <div className={styles.footerLabel}>TOTAL MONTHLY SPEND</div>
                <div className={styles.footerBigTotal}>
                  ₹{totalMonthlySpend.toLocaleString("en-IN")}
                </div>
                <div className={styles.footerSubTotal}>
                  ₹{yearlySpend.toLocaleString("en-IN")} /yr ·{" "}
                  {activeVectorCount} active vector
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
