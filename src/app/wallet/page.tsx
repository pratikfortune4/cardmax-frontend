"use client";
import { IconReceipt, IconChevronRight, IconChevronLeft, IconCompass, IconTrash, IconEdit, IconLock, IconPlus, IconCreditCard, IconRefreshCw, IconArrowLeft } from '@/components/Icons';

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import AddCardModal from "./components/AddCardModal";
import EditCardModal from "./components/EditCardModal";
import ShowMeTheMathsModal, {
  type RecommendationMathData,
} from "@/components/Dashboard/ShowMeTheMathsModal";
import type { BestCardByCategoryItem } from "@/types";
import { API_BASE_URL } from "@/lib/api";
import "./styles.scss";
import { ConfirmationModal } from "@/components/Confirmation/ConfirmationModal";
import { SyncStatementsModal } from "./components/SyncStatementsModal";

// Category icon + display name mapping
const CATEGORY_META: Record<
  string,
  { icon: string; label: string; multiplierFallback: string }
> = {
  "dining-and-delivery": {
    icon: "🍽️",
    label: "Dining & Delivery",
    multiplierFallback: "Dining Rewards",
  },
  dining: {
    icon: "🍽️",
    label: "Dining & Delivery",
    multiplierFallback: "Dining Rewards",
  },
  dinning: {
    icon: "🍽️",
    label: "Dining & Delivery",
    multiplierFallback: "Dining Rewards",
  },
  travel: {
    icon: "✈️",
    label: "Travel & Flights",
    multiplierFallback: "Travel Miles",
  },
  "travel-and-flights": {
    icon: "✈️",
    label: "Travel & Flights",
    multiplierFallback: "Travel Miles",
  },
  fuel: {
    icon: "⛽",
    label: "Fuel Surcharge",
    multiplierFallback: "Fuel Waiver",
  },
  "fuel-surcharge": {
    icon: "⛽",
    label: "Fuel Surcharge",
    multiplierFallback: "Fuel Waiver",
  },
  shopping: {
    icon: "🛍️",
    label: "Online Shopping",
    multiplierFallback: "Cashback",
  },
  "online-shopping": {
    icon: "🛍️",
    label: "Online Shopping",
    multiplierFallback: "Cashback",
  },
  grocery: {
    icon: "🥦",
    label: "Grocery & Spends",
    multiplierFallback: "Cashback",
  },
  groceries: {
    icon: "🥦",
    label: "Grocery & Spends",
    multiplierFallback: "Cashback",
  },
  utilities: {
    icon: "⚡",
    label: "Utilities & Bills",
    multiplierFallback: "Cashback",
  },
  "utility-bills": {
    icon: "⚡",
    label: "Utilities & Bills",
    multiplierFallback: "Cashback",
  },
  entertainment: {
    icon: "🍿",
    label: "Movies & Events",
    multiplierFallback: "BOGO Offer",
  },
};

function getMultiplierLabel(item: BestCardByCategoryItem): string {
  if (item.isCashback && item.cashbackPercent > 0)
    return `${item.cashbackPercent}% Cashback`;
  if (!item.isCashback && item.rewardPointsPer100 > 0)
    return `${item.rewardPointsPer100}X Points`;
  return CATEGORY_META[item.categorySlug]?.multiplierFallback ?? "Rewards";
}

// Static fallback if API returns nothing
const STATIC_FALLBACK: RecommendationMathData[] = [
  {
    category: "Dining & Delivery",
    icon: "🍽️",
    bestCard: "HDFC Swiggy Credit Card",
    multiplier: "10% Cashback",
  },
  {
    category: "Travel & Flights",
    icon: "✈️",
    bestCard: "Axis Atlas Credit Card",
    multiplier: "5X Miles",
  },
  {
    category: "Fuel Surcharge",
    icon: "⛽",
    bestCard: "BPCL SBI Octane",
    multiplier: "25X Points",
  },
  {
    category: "Online Shopping",
    icon: "🛍️",
    bestCard: "SBI Cashback Credit Card",
    multiplier: "5% Cashback",
  },
];

interface SyncResult {
  ok?: boolean;
  processed?: number;
  totalFound?: number;
  message?: string;
  error?: string;
  code?: string;
  results?: Array<{
    issuer: string;
    filename: string;
    size: number;
    status: "parsed" | "error";
    error?: string;
  }>;
}

export default function WalletPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [activeMathRec, setActiveMathRec] =
    useState<RecommendationMathData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  // Live category tiles from API
  const [recTiles, setRecTiles] = useState<RecommendationMathData[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recSource, setRecSource] = useState<"live" | "static">("static");

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const handleSyncStatements = async (periodMonths: number) => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/gmail/sync-statements`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ period_months: periodMonths }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSyncResult({
          ok: true,
          processed: data.data?.statement_count,
          totalFound: data.data?.message_count,
          results: data.data?.statements_metadata
            ?.filter((meta: any) => meta.included)
            .map((meta: any) => ({
              issuer: meta.bank_slug || meta.sender_domain,
              filename: meta.filename,
              size: meta.size_bytes,
              status: "parsed",
              error: null,
            })),
        });
        fetchCards();
      } else {
        setSyncResult({
          error:
            data.error?.message || data.error || "Failed to sync statements.",
        });
      }
    } catch (e: any) {
      setSyncResult({ error: `Error syncing statements: ${e.message}` });
    } finally {
      setIsSyncing(false);
      setIsSyncModalOpen(false);
    }
  };

  // Horizontal scroll ref for recommendations
  const recScrollRef = useRef<HTMLDivElement>(null);
  const handleRecScroll = (direction: "left" | "right") => {
    if (recScrollRef.current) {
      const offset = direction === "left" ? -300 : 300;
      recScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user-cards/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingPage, setIsFetchingPage] = useState(false);

  const fetchRecommendations = async (page: number) => {
    setIsFetchingPage(true);
    setRecLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/dashboard?page=${page}`,
        {
          credentials: "include",
        },
      );
      if (res.ok) {
        const json = await res.json();
        if (json.dashboard?.recommendations) {
          const apiRecs = json.dashboard.recommendations.docs;
          const tiles: RecommendationMathData[] = apiRecs.map((item: any) => {
            return {
              category: item.category,
              categorySlug: item.categorySlug,
              cardName: item.cardName,
              icon: item.icon || "💳",
              bestCard: item.bestCard,
              multiplier: item.multiplier,
            };
          });
          setRecTiles(tiles);
          setCurrentPage(json.dashboard.recommendations.page);
          setTotalPages(json.dashboard.recommendations.totalPages);
          setRecSource("live");

          if (recScrollRef.current) {
            recScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          }
        }
      }
    } catch (err) {
      setRecTiles(STATIC_FALLBACK);
      setRecSource("static");
    } finally {
      setIsFetchingPage(false);
      setRecLoading(false);
    }
  };

  const handlePageChange = (direction: "prev" | "next") => {
    let newPage = currentPage;
    if (direction === "prev" && currentPage > 1) newPage = currentPage - 1;
    if (direction === "next" && currentPage < totalPages)
      newPage = currentPage + 1;
    if (newPage !== currentPage) fetchRecommendations(newPage);
  };

  // Fetch live category tiles from Payload DB on mount
  useEffect(() => {
    fetchRecommendations(1);
  }, []);

  const handleOpenDeleteModal = (id: string) => {
    setCardToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!cardToDelete) return;
    setIsDeletingCard(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/user-cards/${cardToDelete}/deactivate`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (res.ok) {
        fetchCards();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingCard(false);
      setIsDeleteDialogOpen(false);
      setCardToDelete(null);
    }
  };

  const activeCardsCount = cards.filter((c) => c.status === "active").length;

  return (
    <div className="wallet-page-wrapper">
      <div className="wallet-container">
        {/* Navigation / Header */}
        <div className="wallet-breadcrumb">
          <Link href="/" className="btn-back">
            <IconArrowLeft />
            Back to Dashboard
          </Link>
        </div>

        <header className="wallet-header">
          <div className="header-text">
            <h1>My Credit Cards</h1>
            <p>
              Manage your linked credit cards, statement dates, and reward
              limits.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              type="button"
              className="btn-add"
              onClick={() => setIsSyncModalOpen(true)}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <span
                  className="btn-spinner"
                  style={{ width: 14, height: 14, marginRight: 6 }}
                />
              ) : (
                <IconRefreshCw />
              )}
              {isSyncing ? "Syncing..." : "Sync Statements"}
            </button>
            <button
              type="button"
              className="btn-add"
              onClick={() => setIsAddModalOpen(true)}
              id="btn-add-card"
            >
              <IconPlus />
              Add Card
            </button>
          </div>
        </header>

        {/* Overview Stats Bar */}
        {!loading && cards.length > 0 && (
          <section className="wallet-stats-bar" aria-label="Wallet Overview">
            <div className="stat-item">
              <span className="stat-label">Total Cards</span>
              <span className="stat-val">{cards.length}</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-label">Active Cards</span>
              <span className="stat-val">{activeCardsCount}</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-label">Wallet Status</span>
              <span className="stat-val status-good">Optimized</span>
            </div>
          </section>
        )}

        {/* Sync Results */}
        {syncResult && (
          <div className="ingest-results-card" style={{ marginBottom: "1rem" }}>
            {syncResult.error ? (
              <div className="results-error">{syncResult.error}</div>
            ) : (
              <>
                <div className="results-summary">
                  {syncResult.message ||
                    `Processed ${syncResult.processed || 0} statement(s).`}
                </div>
                {syncResult.results && syncResult.results.length > 0 && (
                  <ul className="results-list">
                    {syncResult.results.map((r, i) => (
                      <li key={i} className={`result-item ${r.status}`}>
                        <span className="result-status-tag">{r.status}</span>
                        <span className="result-filename">{r.filename}</span>
                        <span className="result-issuer">({r.issuer})</span>
                        {r.error && (
                          <span className="result-err"> — {r.error}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="wallet-loading">
            <span className="loading-spinner" />
            <p>Loading your cards…</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon" aria-hidden="true">
              <IconCreditCard />
            </div>
            <h3>Your wallet is empty</h3>
            <p>
              Add a credit card to track rewards, statement dates, and
              personalized card perks.
            </p>
            <button
              type="button"
              className="btn-add"
              onClick={() => setIsAddModalOpen(true)}
            >
              <IconPlus />
              Add Your First Card
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {cards.map((card) => {
              const isActive = card.status === "active";

              const cardObj =
                typeof card.card === "object" && card.card
                  ? card.card
                  : typeof card.creditCard === "object" && card.creditCard
                    ? card.creditCard
                    : null;

              const bankName =
                (typeof cardObj?.bank === "object" && cardObj.bank?.name) ||
                (typeof cardObj?.bank === "string" && cardObj.bank) ||
                card.bankName ||
                "Bank";

              const cardName = cardObj?.name || card.cardName || "Credit Card";
              const displayName = card.displayName || null;
              const dueDay = card.paymentDueDay ?? card.billingCycleDay ?? null;
              const physical =
                typeof card.physicalCard === "object" && card.physicalCard
                  ? card.physicalCard
                  : null;

              return (
                <article
                  key={card.id}
                  className={`wallet-card ${!isActive ? "inactive" : ""}`}
                >
                  <div className="card-top">
                    <div className="card-branding">
                      <span className="bank-name">{bankName}</span>
                      <h2 className="card-name">{displayName || cardName}</h2>
                      {displayName && (
                        <span className="card-subtitle-type">{cardName}</span>
                      )}
                    </div>
                    <span
                      className={`badge ${isActive ? "status-active" : "status-inactive"}`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {physical && physical.panMasked && (
                    <div className="card-vault-badge">
                      <div className="vault-pan-wrap">
                        <IconLock />
                        <span className="vault-pan">{physical.panMasked}</span>
                      </div>
                      <div className="vault-meta">
                        {physical.expiryMonth && physical.expiryYear && (
                          <span className="vault-exp">
                            Exp {String(physical.expiryMonth).padStart(2, "0")}/
                            {String(physical.expiryYear).slice(-2)}
                          </span>
                        )}
                        {physical.brand && (
                          <span className="vault-brand">
                            {physical.brand.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="card-details-grid">
                    {card.creditLimit != null && (
                      <div className="detail-item">
                        <span className="detail-label">Credit Limit</span>
                        <span className="detail-value">
                          ₹{Number(card.creditLimit).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {card.statementDay != null && (
                      <div className="detail-item">
                        <span className="detail-label">Statement Day</span>
                        <span className="detail-value">
                          {card.statementDay}th of month
                        </span>
                      </div>
                    )}
                    {dueDay != null && (
                      <div className="detail-item">
                        <span className="detail-label">Payment Due</span>
                        <span className="detail-value">
                          {dueDay}th of month
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn-card-action secondary"
                      onClick={() => setEditingCard(card)}
                      id={`btn-edit-card-${card.id}`}
                    >
                      <IconEdit />
                      Edit
                    </button>
                    {isActive && (
                      <button
                        type="button"
                        className="btn-card-action danger"
                        onClick={() => handleOpenDeleteModal(card.id)}
                        id={`btn-remove-card-${card.id}`}
                      >
                        <IconTrash />
                        Remove
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ── Reward Recommendations Widget ──────────────────────────── */}
        <section className="wallet-recommendations-section">
          <div className="wallet-rec-header">
            <div className="wallet-rec-header-top">
              <div className="wallet-rec-title-wrap">
                <h2 className="wallet-rec-title">
                  <IconCompass />
                  <span>Best Card by Category</span>
                </h2>
                {!recLoading && (
                  <span
                    className={`wallet-rec-live-badge ${recSource === "live" ? "is-live" : "is-static"}`}
                  >
                    {recSource === "live" ? "● Live from DB" : "● Static data"}
                  </span>
                )}
              </div>
              {totalPages > 1 && (
                <div className="wallet-rec-scroll-controls">
                  <button
                    type="button"
                    className="wallet-scroll-btn"
                    onClick={() => handlePageChange("prev")}
                    disabled={currentPage === 1 || isFetchingPage}
                    aria-label="Previous page"
                    title="Previous page"
                    style={{
                      opacity: currentPage === 1 || isFetchingPage ? 0.5 : 1,
                      cursor:
                        currentPage === 1 || isFetchingPage
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <IconChevronLeft />
                  </button>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {isFetchingPage ? "..." : `${currentPage} / ${totalPages}`}
                  </span>
                  <button
                    type="button"
                    className="wallet-scroll-btn"
                    onClick={() => handlePageChange("next")}
                    disabled={currentPage === totalPages || isFetchingPage}
                    aria-label="Next page"
                    title="Next page"
                    style={{
                      opacity:
                        currentPage === totalPages || isFetchingPage ? 0.5 : 1,
                      cursor:
                        currentPage === totalPages || isFetchingPage
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <IconChevronRight />
                  </button>
                </div>
              )}
            </div>
            <p className="wallet-rec-subtitle">
              See the exact maths behind each card recommendation
            </p>
          </div>

          {recLoading ? (
            <div className="wallet-rec-scroll-wrapper">
              <div className="wallet-rec-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="wallet-rec-card"
                    style={{ minHeight: 100 }}
                  >
                    <div
                      style={{
                        height: 12,
                        width: "60%",
                        borderRadius: 6,
                        background: "rgba(108,76,241,0.1)",
                        marginBottom: 8,
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 16,
                        width: "80%",
                        borderRadius: 6,
                        background: "rgba(108,76,241,0.07)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                    <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="wallet-rec-scroll-wrapper">
              <div className="wallet-rec-grid" ref={recScrollRef}>
                {recTiles.map((rec, idx) => (
                  <div
                    key={`${rec.category}-${rec.bestCard}-${idx}`}
                    className="wallet-rec-card"
                  >
                    <div className="wallet-rec-card__top">
                      <span className="wallet-rec-card__icon">{rec.icon}</span>
                      <span className="wallet-rec-card__category">
                        {rec.category}
                      </span>
                      <span className="wallet-rec-card__multiplier">
                        {rec.multiplier}
                      </span>
                    </div>
                    <div className="wallet-rec-card__name">{rec.bestCard}</div>
                    <button
                      className="wallet-show-maths-btn"
                      id={`wallet-show-maths-${rec.category.replace(/\s+/g, "-").replace(/&/g, "and").toLowerCase()}`}
                      onClick={() => setActiveMathRec(rec)}
                      aria-label={`Show the maths behind ${rec.category} recommendation`}
                    >
                      <IconReceipt />
                      Show Me the Maths →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
      {/* end wallet-container */}

      {/* Interactive Modals */}
      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCardAdded={fetchCards}
      />

      <EditCardModal
        isOpen={Boolean(editingCard)}
        card={editingCard}
        onClose={() => setEditingCard(null)}
        onCardUpdated={fetchCards}
      />

      {/* Show Me the Maths Modal */}
      {activeMathRec && (
        <ShowMeTheMathsModal
          recommendation={activeMathRec}
          onClose={() => setActiveMathRec(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!isDeletingCard) {
            setIsDeleteDialogOpen(false);
            setCardToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeactivate}
        title="Remove Card"
        message="Are you sure you want to remove this card from your wallet?"
        confirmText="Remove Card"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingCard}
      />

      <SyncStatementsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSync={handleSyncStatements}
        isSyncing={isSyncing}
      />
    </div>
  );
}
