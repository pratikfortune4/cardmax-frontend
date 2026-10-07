"use client";

import React, { useEffect, useState, useMemo, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import styles from "./Results.module.scss";

// --- CONFIG ---
// 1. HERO_METRICS: Displayed at the top. Paths can be nested (e.g. "wallet_score.score")
const HERO_METRICS = [
  { label: "Wallet Score", path: "wallet_score.score", suffix: "/100" },
  { label: "Current Yield", path: "money_ladder.rungs.held_actual_inr", suffix: "/yr" },
  { label: "Optimized Yield", path: "money_ladder.rungs.recommended_inr", suffix: "/yr" },
  { label: "Total Upside", path: "money_ladder.deltas.total_upside_inr", suffix: "/yr" },
  { label: "Accuracy", path: "accuracy_score.score", suffix: "%" },
];

// 2. NOTICE_PATHS: Paths to read string/string[] for banner notices
const NOTICE_PATHS = [
  { path: "rupay_upi_gap.caveats", tone: "info" },
  { path: "rupay_upi_gap.triggered", tone: "info", overrideText: "RuPay UPI Optimization Available" },
  { path: "accuracy_score.caveats", tone: "warn" }
];

// 3. SECTION_META: Metadata for top-level keys
const SECTION_META: Record<string, { title?: string, icon?: string, priority?: number, open?: boolean }> = {
  wallet_score: { title: "Wallet Score Details", icon: "🎯", priority: 1, open: true },
  three_verdict: { title: "Portfolio Verdict", icon: "⚖️", priority: 2, open: true },
  money_ladder: { title: "Optimization Upside", icon: "🚀", priority: 3, open: true },
  spend_insight: { title: "Spend Analysis", icon: "📊", priority: 4, open: true },
  pie_chart_data: { title: "Category Breakdown", icon: "🍕", priority: 5, open: true },
  accuracy_score: { title: "Engine Accuracy", icon: "🔬", priority: 6, open: false },
  statements_metadata: { title: "Processed Statements", icon: "📄", priority: 7, open: false }
};

// 4. HIDDEN_KEYS: Never render these top-level or child keys if they match exactly
const HIDDEN_KEYS = new Set(["card_benefits", "rupay_upi_gap"]);

// --- HELPERS ---
function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function formatCurrency(val: number): string {
  if (isNaN(val)) return `${val}`;
  return `₹${Number(val).toLocaleString("en-IN")}`;
}

function humanize(str: string): string {
  const acronyms = ["UPI", "MCC", "INR", "ROI", "ID", "URL"];
  return str
    .split("_")
    .map(word => {
      const upper = word.toUpperCase();
      if (acronyms.includes(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function isCurrencyKey(k: string): boolean {
  const lower = k.toLowerCase();
  return lower.includes("inr") || lower.includes("amount") || lower.includes("spend") || 
         lower.includes("fee") || lower.includes("yield") || lower.includes("reward") || lower.includes("contribution");
}

function isPercentKey(k: string): boolean {
  const lower = k.toLowerCase();
  return lower.includes("pct") || lower.includes("percent") || lower.includes("divergence") || lower.includes("markup");
}

function isSubscore(k: string, v: any): boolean {
  return k.toLowerCase().includes("subscore") && typeof v === "number" && v <= 1;
}

function formatValue(key: string, val: any): React.ReactNode {
  if (typeof val === "boolean") {
    return <span className={styles.badge}>{val ? "Yes" : "No"}</span>;
  }
  if (typeof val === "number") {
    if (isCurrencyKey(key)) return formatCurrency(val);
    if (isPercentKey(key)) return `${val}%`;
    if (isSubscore(key, val)) return `${Math.round(val * 100)}%`;
    return val;
  }
  if (typeof val === "string" && val.startsWith("http")) {
    return <a href={val} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>{val.length > 30 ? val.substring(0, 30) + "..." : val}</a>;
  }
  return String(val);
}

function isEmpty(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === "string" && val.trim() === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === "object" && Object.keys(val).length === 0) return true;
  return false;
}

// --- CONTEXT ---
const RenderContext = createContext({ expandAllVersion: 0, showTechnical: false });

// --- COMPONENTS ---
function RecursiveRenderer({ data, name = "Data" }: { data: any, name?: string }) {
  const { showTechnical } = useContext(RenderContext);

  if (isEmpty(data)) return null;

  // Primitives
  if (typeof data !== "object") {
    return <div className={styles.kvItem}>
      <span className={styles.kvLabel}>{humanize(name)}</span>
      <span className={styles.kvValue}>{formatValue(name, data)}</span>
    </div>;
  }

  // Arrays
  if (Array.isArray(data)) {
    // Array of primitives
    if (data.every(item => typeof item !== "object")) {
      return (
        <div className={styles.kvItem}>
          <span className={styles.kvLabel}>{humanize(name)}</span>
          <div className={styles.chips}>
            {data.map((item, i) => <span key={i} className={styles.chip}>{String(item)}</span>)}
          </div>
        </div>
      );
    }

    // Array of objects (flat vs nested)
    const isFlatObjects = data.every(item => typeof item === "object" && item !== null && Object.values(item).every(v => typeof v !== "object" || v === null));
    const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item || {}))));
    
    if (isFlatObjects && allKeys.length <= 10) {
      return (
        <div className={styles.kvItem}>
          <span className={styles.kvLabel}>{humanize(name)}</span>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>{allKeys.filter(k => showTechnical || !k.startsWith("_")).map(k => <th key={k}>{humanize(k)}</th>)}</tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    {allKeys.filter(k => showTechnical || !k.startsWith("_")).map(k => (
                      <td key={k}>{formatValue(k, row[k])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Array of nested objects (Accordion)
    return (
      <div className={styles.kvItem}>
        <span className={styles.kvLabel}>{humanize(name)}</span>
        <div>
          {data.map((item, i) => {
            const titleField = ["card_name", "name", "merchant", "label", "bank", "source_filename", "filename"].find(f => item[f]);
            const title = titleField ? item[titleField] : `Item ${i + 1}`;
            return (
              <Collapsible key={i} title={title}>
                <RecursiveRenderer data={item} />
              </Collapsible>
            );
          })}
        </div>
      </div>
    );
  }

  // Objects
  const entries = Object.entries(data)
    .filter(([k, v]) => !HIDDEN_KEYS.has(k) && !isEmpty(v) && (showTechnical || !k.startsWith("_")));

  const primitives = entries.filter(([, v]) => typeof v !== "object");
  const complex = entries.filter(([, v]) => typeof v === "object");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {primitives.length > 0 && (
        <div className={styles.kvGrid}>
          {primitives.map(([k, v]) => (
            <div key={k} className={styles.kvItem}>
              <span className={styles.kvLabel}>{humanize(k)}</span>
              <span className={styles.kvValue}>{formatValue(k, v)}</span>
            </div>
          ))}
        </div>
      )}
      {complex.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {complex.map(([k, v]) => (
            <Collapsible key={k} title={humanize(k)}>
              <RecursiveRenderer data={v} name={k} />
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

function Collapsible({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const { expandAllVersion } = useContext(RenderContext);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (expandAllVersion > 0) setIsOpen(true);
    else if (expandAllVersion < 0) setIsOpen(false);
  }, [expandAllVersion]);

  return (
    <details className={styles.collapsible} open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}

// --- MAIN COMPONENT ---
export default function ResultsClient() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Controls
  const [expandAllVersion, setExpandAllVersion] = useState(0);
  const [showTechnical, setShowTechnical] = useState(false);
  
  // Modals
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("optimizationData");
      if (stored) {
        let parsed = JSON.parse(stored);
        // Unwrap envelopes
        if (parsed.data && Object.keys(parsed).length === 1) parsed = parsed.data;
        else if (parsed.result && Object.keys(parsed).length === 1) parsed = parsed.result;
        else if (parsed.response && Object.keys(parsed).length === 1) parsed = parsed.response;
        setData(parsed);
      }
    } catch (e) {
      console.error("Failed to parse optimization data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const { heroMetrics, notices, topLevelKeys, cardsLists, overviewPrimitives } = useMemo(() => {
    if (!data) return { heroMetrics: [], notices: [], topLevelKeys: [], cardsLists: [], overviewPrimitives: {} };

    // 1. Hero Metrics
    const hm = HERO_METRICS.map(m => {
      const val = getByPath(data, m.path);
      return typeof val === 'number' ? { ...m, value: val } : null;
    }).filter(Boolean);

    // 2. Notices
    const n = new Set<string>();
    const nObjs: { text: string, tone: string }[] = [];
    NOTICE_PATHS.forEach(p => {
      const val = getByPath(data, p.path);
      if (val === true && p.overrideText) {
        if (!n.has(p.overrideText)) {
          n.add(p.overrideText);
          nObjs.push({ text: p.overrideText, tone: p.tone });
        }
      } else if (typeof val === 'string') {
        if (!n.has(val)) {
          n.add(val);
          nObjs.push({ text: val, tone: p.tone });
        }
      } else if (Array.isArray(val)) {
        val.forEach(v => {
          if (typeof v === 'string' && !n.has(v)) {
            n.add(v);
            nObjs.push({ text: v, tone: p.tone });
          }
        });
      }
    });

    // 3. Top Level Keys & Overview Primitives
    const tlk: { key: string, meta: any, val: any }[] = [];
    const op: any = {};
    Object.entries(data).forEach(([k, v]) => {
      if (HIDDEN_KEYS.has(k) || isEmpty(v) || (!showTechnical && k.startsWith("_"))) return;
      if (typeof v !== 'object') {
        op[k] = v;
      } else {
        const meta = SECTION_META[k] || { title: humanize(k), priority: 99, open: false };
        tlk.push({ key: k, meta, val: v });
      }
    });
    tlk.sort((a, b) => (a.meta.priority || 99) - (b.meta.priority || 99));

    // 4. Find cards_detail lists
    const cl: { path: string, cards: any[] }[] = [];
    function walk(obj: any, currentPath: string) {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        obj.forEach((v, i) => walk(v, `${currentPath}[${i}]`));
      } else {
        Object.entries(obj).forEach(([k, v]) => {
          if (k === 'cards_detail' && Array.isArray(v) && v.length > 0) {
            cl.push({ path: currentPath, cards: v });
          } else {
            walk(v, `${currentPath}.${k}`);
          }
        });
      }
    }
    walk(data, "root");

    return { heroMetrics: hm, notices: nObjs, topLevelKeys: tlk, cardsLists: cl, overviewPrimitives: op };
  }, [data, showTechnical]);

  if (loading) return <div className={styles.container}>Loading results...</div>;
  if (!data) return (
    <div className={styles.container}>
      <div className={styles.emptyState}>
        <h2>No Results Found</h2>
        <p>We couldn't find any recent optimization results.</p>
        <button onClick={() => router.push("/statements")}>Go Back</button>
      </div>
    </div>
  );

  return (
    <RenderContext.Provider value={{ expandAllVersion, showTechnical }}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          
          <header className={styles.header}>
            <h1>Optimization Results</h1>
            <p>Your analysis is complete.</p>
          </header>

          <div className={styles.toolbar}>
            <div>
              <button className={styles.linkBtn} onClick={() => setExpandAllVersion(v => v > 0 ? v + 1 : 1)} style={{ marginRight: '16px' }}>Expand All</button>
              <button className={styles.linkBtn} onClick={() => setExpandAllVersion(v => v < 0 ? v - 1 : -1)}>Collapse All</button>
            </div>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary, #64748b)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={showTechnical} onChange={e => setShowTechnical(e.target.checked)} />
              Show technical fields
            </label>
          </div>

          {notices.length > 0 && (
            <div className={styles.notices}>
              {notices.map((n, i) => (
                <div key={i} className={`${styles.notice} ${n.tone === 'warn' ? styles.noticeWarn : styles.noticeInfo}`}>
                  <span>{n.tone === 'warn' ? '⚠️' : '💡'}</span>
                  <span>{n.text}</span>
                </div>
              ))}
            </div>
          )}

          {heroMetrics.length > 0 && (
            <div className={styles.card}>
              <h2><span>📈</span> Key Metrics</h2>
              <div className={styles.grid}>
                {heroMetrics.map((m: any, i) => (
                  <div key={i} className={styles.metricCard}>
                    <span className={styles.label}>{m.label}</span>
                    <span className={styles.value}>{formatValue(m.path, m.value)}{m.suffix && m.suffix !== '%' ? m.suffix : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(overviewPrimitives).length > 0 && (
            <div className={styles.card}>
              <h2><span>📝</span> Overview</h2>
              <RecursiveRenderer data={overviewPrimitives} />
            </div>
          )}

          {cardsLists.map((list, i) => (
            <div key={i} className={styles.card}>
              <h2><span>💳</span> {list.path.includes("held") ? "Your Current Cards" : "Recommended Cards"}</h2>
              <div className={styles.cardList}>
                {list.cards.map((c: any, ci: number) => (
                  <div key={ci} className={styles.cardRow} onClick={() => { setSelectedCard(c); setActiveTab('overview'); }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--color-text-primary, #0f172a)' }}>{c.card_name || c.name || "Unknown Card"}</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary, #64748b)' }}>{c.bank || "Unknown Bank"}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary, #4f46e5)' }}>
                        {formatCurrency(c.actual_earned_inr || c.annual_reward_inr || 0)} / yr
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '4px' }}>View Details &rarr;</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {topLevelKeys.map(({ key, meta, val }) => (
            <div key={key} className={styles.card}>
              <Collapsible title={`${meta.icon || '📄'} ${meta.title || humanize(key)}`} defaultOpen={meta.open}>
                <RecursiveRenderer data={val} name={key} />
              </Collapsible>
            </div>
          ))}

          <div className={styles.backButtonWrap}>
            <button onClick={() => router.push("/statements")}>← Back to Sync</button>
          </div>
        </div>

        {selectedCard && (
          <div className={styles.modalOverlay} onClick={() => setSelectedCard(null)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', margin: '0 0 4px 0' }}>{selectedCard.card_name || selectedCard.name || "Card Details"}</h2>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary, #64748b)' }}>{selectedCard.bank}</p>
                </div>
                <button onClick={() => setSelectedCard(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary, #64748b)' }}>&times;</button>
              </div>

              {(() => {
                const primitives: any = {};
                const nested: any = {};
                Object.entries(selectedCard).forEach(([k, v]) => {
                  if (typeof v !== 'object') primitives[k] = v;
                  else nested[k] = v;
                });
                const benefits = data.card_benefits?.[selectedCard.card_id];
                const hasBenefits = benefits && benefits.length > 0;
                const hasDetails = Object.keys(nested).length > 0;

                const availableTabs = ['overview'];
                if (hasBenefits) availableTabs.push('benefits');
                if (hasDetails) availableTabs.push('details');

                if (!availableTabs.includes(activeTab)) setActiveTab('overview');

                return (
                  <>
                    <div className={styles.tabs}>
                      {availableTabs.map(t => (
                        <button key={t} className={activeTab === t ? styles.tabActive : ''} onClick={() => setActiveTab(t)}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                      {activeTab === 'overview' && (
                        <div>
                          <RecursiveRenderer data={primitives} />
                          {primitives.application_url && (
                            <a href={primitives.application_url} target="_blank" rel="noreferrer" className={styles.applyBtn}>
                              Apply Now
                            </a>
                          )}
                        </div>
                      )}
                      {activeTab === 'benefits' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {benefits.map((b: any, i: number) => (
                            <div key={i} style={{ padding: '16px', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px' }}>
                              <h4 style={{ margin: '0 0 8px 0' }}>{b.name}</h4>
                              <p style={{ margin: 0, color: 'var(--color-text-secondary, #64748b)', fontSize: '0.9rem' }}>{b.copy}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {activeTab === 'details' && <RecursiveRenderer data={nested} />}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </RenderContext.Provider>
  );
}
