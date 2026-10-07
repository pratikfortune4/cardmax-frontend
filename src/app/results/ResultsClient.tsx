"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Results.module.scss";

export default function ResultsClient() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("optimizationData");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse optimization data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className={styles.container}>Loading results...</div>;
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>No Results Found</h2>
          <p>We couldn't find any recent optimization results.</p>
          <button onClick={() => router.push("/statements")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Determine what type of response we have
  const hasOptimization = !!data.three_verdict || !!data.wallet_score || !!data.money_ladder;
  const hasSpendInsight = !!data.spend_insight || !!data.category_l1_breakdown;
  const hasStatementsList = !!data.statements_metadata && data.statements_metadata.length > 0;

  // Helpers
  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN")}`;
  
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        
        <header className={styles.header}>
          <h1>Optimization Results</h1>
          <p>
            {hasOptimization 
              ? "Your personalized portfolio analysis is complete."
              : "Here are the details from your statement sync."}
          </p>
        </header>

        {/* 1. Wallet Score & High Level Verdict */}
        {data.wallet_score && (
          <div className={styles.card}>
            <h2><span>🎯</span> Wallet Score: {data.wallet_score.score} / 100</h2>
            <p style={{ color: data.wallet_score.band_color === 'red-600' ? '#ef4444' : '#10b981', fontSize: '1.1rem', fontWeight: 500 }}>
              {data.wallet_score.band_copy}
            </p>
          </div>
        )}

        {/* 2. The Three Verdicts */}
        {data.three_verdict && (
          <div className={styles.card}>
            <h2><span>⚖️</span> Portfolio Verdict</h2>
            <div className={styles.verdictGrid}>
              {['verdict_1', 'verdict_2', 'verdict_3'].map((key) => {
                const v = data.three_verdict[key];
                if (!v) return null;
                return (
                  <div key={key} className={`${styles.verdictItem} ${styles[v.color] || ''}`}>
                    <div className={styles.vLabel}>{v.label}</div>
                    <div className={styles.vValue}>{v.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Spend Insights / Categories */}
        {hasSpendInsight && (
          <div className={styles.card}>
            <h2><span>📊</span> Spend Analysis</h2>
            <div className={styles.grid}>
              <div className={styles.metricCard}>
                <span className={styles.label}>Total Spend Analysed</span>
                <span className={styles.value}>
                  {data.spend_insight?.total_spend_inr 
                    ? formatCurrency(data.spend_insight.total_spend_inr)
                    : data.monthly_total_spend ? formatCurrency(data.monthly_total_spend) : 'N/A'}
                </span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.label}>Top Category</span>
                <span className={styles.value} style={{ color: 'var(--color-primary, #4f46e5)' }}>
                  {data.spend_insight?.top_category?.ui_label || 'N/A'}
                </span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.label}>Transactions</span>
                <span className={styles.value}>
                  {data.transactions_total || data.spend_insight?.transactions_total || 0}
                </span>
              </div>
            </div>

            {/* Category L1 Breakdown */}
            {data.category_l1_breakdown && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--color-text-secondary, #475569)' }}>Category Breakdown</h3>
                <div className={styles.categoryList}>
                  {Object.entries(data.category_l1_breakdown).map(([cat, details]: [string, any]) => (
                    <div key={cat} className={styles.categoryRow}>
                      <span className={styles.catName}>{cat}</span>
                      <span className={styles.catValue}>{formatCurrency(details.total_inr)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Money Ladder / Upside */}
        {data.money_ladder?.deltas && (
          <div className={styles.card}>
            <h2><span>🚀</span> Optimization Upside</h2>
            <div className={styles.grid}>
              <div className={styles.metricCard}>
                <span className={styles.label}>Current Yield</span>
                <span className={styles.value}>{formatCurrency(data.money_ladder.rungs.held_actual_inr)}/yr</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.label}>Potential Yield</span>
                <span className={styles.value}>{formatCurrency(data.money_ladder.rungs.recommended_inr)}/yr</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.label}>Net Gain</span>
                <span className={`${styles.value} ${styles.highlightValue}`}>
                  +{formatCurrency(data.money_ladder.deltas.total_upside_inr)}/yr
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Basic Statements List (Fallback / Sync View) */}
        {hasStatementsList && !hasOptimization && (
          <div className={styles.card}>
            <h2><span>📄</span> Processed Statements ({data.statement_count || data.statements_metadata.length})</h2>
            <div className={styles.statementList}>
              {data.statements_metadata.map((r: any, idx: number) => (
                <div key={r.id || idx} className={styles.statementRow}>
                  <span className={styles.sName}>
                    {r.bank_slug || r.bank || "Unknown"} · {(r.filename || r.name || `Statement ${idx + 1}`).replace(".pdf", "")}
                  </span>
                  <span className={styles.sStatus}>
                    {r.status || "PARSED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.backButtonWrap}>
          <button onClick={() => router.push("/statements")}>
            ← Back to Sync
          </button>
        </div>

      </div>
    </div>
  );
}
