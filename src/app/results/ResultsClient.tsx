"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Results.module.scss";

export default function ResultsClient() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

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
  const hasSpendInsight = !!data.spend_insight || !!data.pie_chart_data;
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

        {/* RuPay UPI Gap Banner */}
        {data.rupay_upi_gap?.triggered && (
          <div style={{ padding: '16px', background: 'var(--color-primary-subtle, rgba(79, 70, 229, 0.1))', border: '1px solid var(--color-primary, #4f46e5)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <span style={{ fontSize: '1.5rem' }}>💳</span>
             <div>
                <h3 style={{ color: 'var(--color-primary, #4f46e5)', fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>RuPay UPI Optimization Available</h3>
                <p style={{ color: 'var(--color-text-secondary, #475569)', fontSize: '0.9rem' }}>You are currently missing out on UPI rewards. Adding a RuPay credit card would optimize this spend.</p>
             </div>
          </div>
        )}

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
            {data.pie_chart_data && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--color-text-secondary, #475569)' }}>Category Breakdown</h3>
                <div className={styles.categoryList}>
                  {Object.entries(data.pie_chart_data).map(([cat, amount]: [string, any]) => (
                    <div key={cat} className={styles.categoryRow}>
                      <span className={styles.catName}>{cat}</span>
                      <span className={styles.catValue}>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3.5 Engine Accuracy Score */}
        {data.accuracy_score && (
          <div className={styles.card}>
            <h2><span>🔬</span> Engine Accuracy</h2>
            <div className={styles.grid}>
               <div className={styles.metricCard}>
                  <span className={styles.label}>Overall Score</span>
                  <span className={styles.value} style={{ color: data.accuracy_score.score >= 85 ? 'var(--color-success, #22c55e)' : 'var(--color-warning, #f59e0b)' }}>
                    {data.accuracy_score.score}%
                  </span>
               </div>
               <div className={styles.metricCard}>
                  <span className={styles.label}>Read Confidence</span>
                  <span className={styles.value}>
                    {Math.round((data.accuracy_score.read_subscore || 0) * 100)}%
                  </span>
               </div>
               <div className={styles.metricCard}>
                  <span className={styles.label}>Data Provenance</span>
                  <span className={styles.value}>
                    {Math.round((data.accuracy_score.data_subscore || 0) * 100)}%
                  </span>
               </div>
            </div>
            {data.accuracy_score.caveats && data.accuracy_score.caveats.length > 0 && (
               <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
                 <h3 style={{ marginBottom: '8px', fontSize: '1rem', color: '#b45309', fontWeight: 600 }}>Caveats Detected</h3>
                 <ul style={{ paddingLeft: '20px', color: '#b45309', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                   {data.accuracy_score.caveats.map((c: string, i: number) => <li key={i}>{c}</li>)}
                 </ul>
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

        {/* 4.5 Recommended Cards */}
        {data.portfolios_by_preference?.max_yield?.["1"]?.cards_detail && (
          <div className={styles.card}>
            <h2><span>⭐</span> Recommended Cards</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {data.portfolios_by_preference.max_yield["1"].cards_detail.map((c: any) => (
                  <div key={c.card_id} 
                       onClick={() => setSelectedCard(c)}
                       style={{ 
                         padding: '16px', 
                         border: '1px solid var(--color-border, #e2e8f0)', 
                         borderRadius: '12px', 
                         cursor: 'pointer',
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         background: 'var(--color-surface-white, #ffffff)',
                         boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                       }}>
                     <div>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary, #0f172a)', margin: '0 0 4px 0' }}>{c.card_name}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>{c.bank}</p>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', color: 'var(--color-success, #22c55e)', fontWeight: 600 }}>{formatCurrency(c.annual_reward_inr)} / yr</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-primary, #4f46e5)', fontWeight: 500 }}>View Details &rarr;</div>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        )}

        {/* 4.6 Your Current Cards */}
        {data.held_cards_portfolio?.cards_detail && data.held_cards_portfolio.cards_detail.length > 0 && (
          <div className={styles.card}>
            <h2><span>💳</span> Your Current Cards</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {data.held_cards_portfolio.cards_detail.map((c: any) => (
                  <div key={c.card_id} 
                       onClick={() => setSelectedCard(c)}
                       style={{ 
                         padding: '16px', 
                         border: '1px solid var(--color-border, #e2e8f0)', 
                         borderRadius: '12px', 
                         cursor: 'pointer',
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         background: 'var(--color-surface-white, #ffffff)',
                         boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                       }}>
                     <div>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary, #0f172a)', margin: '0 0 4px 0' }}>{c.card_name}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>{c.bank}</p>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', color: 'var(--color-text-primary, #0f172a)', fontWeight: 600 }}>Earns {formatCurrency(c.actual_earned_inr || c.annual_reward_inr)} / yr</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-primary, #4f46e5)', fontWeight: 500 }}>View Details &rarr;</div>
                     </div>
                  </div>
               ))}
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

      {/* --- Modal --- */}
      {selectedCard && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }} onClick={() => { setSelectedCard(null); setActiveTab('overview'); }}>
          <div style={{
            background: 'var(--color-surface-white, #ffffff)', 
            width: '100%', maxWidth: '600px', maxHeight: '90vh', 
            borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary, #0f172a)', margin: '0 0 4px 0' }}>{selectedCard.card_name}</h2>
                  <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>{selectedCard.bank}</p>
               </div>
               <button onClick={() => { setSelectedCard(null); setActiveTab('overview'); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary, #64748b)' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border, #e2e8f0)', background: 'var(--color-bg-main, #f8fafc)' }}>
               {['overview', 'benefits', 'fees'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   style={{
                     flex: 1, padding: '16px', background: 'none', border: 'none', 
                     borderBottom: activeTab === tab ? '2px solid var(--color-primary, #4f46e5)' : '2px solid transparent',
                     color: activeTab === tab ? 'var(--color-primary, #4f46e5)' : 'var(--color-text-secondary, #64748b)',
                     fontWeight: activeTab === tab ? 600 : 500,
                     textTransform: 'capitalize', cursor: 'pointer', fontSize: '1rem'
                   }}>
                   {tab}
                 </button>
               ))}
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
               {activeTab === 'overview' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-main, #f8fafc)', borderRadius: '8px' }}>
                       <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Annual Reward</span>
                       <span style={{ fontWeight: 600, color: 'var(--color-success, #22c55e)' }}>{formatCurrency(selectedCard.annual_reward_inr)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-main, #f8fafc)', borderRadius: '8px' }}>
                       <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Net Contribution</span>
                       <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #0f172a)' }}>{formatCurrency(selectedCard.net_contribution_inr)}</span>
                    </div>
                    {selectedCard.application_url && (
                       <a href={selectedCard.application_url} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', padding: '12px', background: 'var(--color-primary, #4f46e5)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, marginTop: '8px' }}>
                         Apply Now
                       </a>
                    )}
                 </div>
               )}

               {activeTab === 'benefits' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {data.card_benefits?.[selectedCard.card_id]?.length > 0 ? (
                       data.card_benefits[selectedCard.card_id].map((b: any, idx: number) => (
                          <div key={idx} style={{ padding: '16px', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px' }}>
                             <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary, #0f172a)' }}>{b.name}</h4>
                             <p style={{ margin: 0, color: 'var(--color-text-secondary, #64748b)', fontSize: '0.9rem' }}>{b.copy}</p>
                          </div>
                       ))
                    ) : (
                       <p style={{ color: 'var(--color-text-secondary, #64748b)', textAlign: 'center', padding: '24px' }}>No benefits data available.</p>
                    )}
                 </div>
               )}

               {activeTab === 'fees' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-main, #f8fafc)', borderRadius: '8px' }}>
                       <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Joining Fee</span>
                       <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #0f172a)' }}>{formatCurrency(selectedCard.joining_fee_inr || 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-main, #f8fafc)', borderRadius: '8px' }}>
                       <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Annual Fee</span>
                       <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #0f172a)' }}>{formatCurrency(selectedCard.annual_fee_inr || 0)}</span>
                    </div>
                    {selectedCard.waiver_spend_target_inr > 0 && (
                      <div style={{ padding: '16px', border: '1px dashed var(--color-primary, #4f46e5)', borderRadius: '8px', background: 'rgba(79,70,229,0.05)' }}>
                         <p style={{ margin: 0, color: 'var(--color-primary, #4f46e5)', fontSize: '0.9rem' }}>
                           Annual fee is waived if you spend <strong>{formatCurrency(selectedCard.waiver_spend_target_inr)}</strong> in a year.
                         </p>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-main, #f8fafc)', borderRadius: '8px' }}>
                       <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Forex Markup</span>
                       <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #0f172a)' }}>{selectedCard.forex_markup_percent}%</span>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
