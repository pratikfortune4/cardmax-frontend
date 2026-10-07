"use client";
import { IconTrash, IconEye, IconEyeOff, IconClock, IconCreditCard, IconPlus, IconCheckCircle, IconAlertCircle, IconUnlock, IconArrowLeft } from '@/components/Icons';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import styles from "./my-cards.module.scss";
import { API_BASE_URL } from "@/lib/api";
import { ConfirmationModal } from "../Confirmation/ConfirmationModal";

/**
 * My Cards — frontend for the secure card vault.
 *
 * PCI safety rules implemented here:
 * - Only masked PANs (`panMasked`) are ever fetched/rendered for the list.
 * - The full PAN is requested ONLY through an authenticated API call
 *   (`POST /api/vault-cards/:id/reveal`) and kept in React state for a short,
 *   fixed window before being cleared automatically.
 * - The full PAN is never written to localStorage/sessionStorage, never placed
 *   in URLs, never sent to analytics, and never logged.
 * - Revealing one card clears any previously revealed card.
 */

interface CardView {
  id: string;
  nickname?: string | null;
  bank?: { id: string; name?: string | null } | string | null;
  cardType?: string | null;
  brand?: string | null;
  panMasked?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
}

/** One bank master option served by GET /api/vault-cards/banks for the dropdown.. */
interface BankOption {
  id: string;
  name: string;
  shortName?: string | null;
}

interface RevealData {
  id: string;
  pan: string;
  cardholderName: string;
  expiryMonth: number | null;
  expiryYear: number | null;
}

interface CardResponse {
  ok?: boolean;
  error?: string;
  code?: string;
  card?: CardView;
  matches?: CardView[];
  data?: RevealData;
}

const REVEAL_CLEAR_MS = 20_000;

const brandLabel = (brand: string | null | undefined): string => {
  switch (brand) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "American Express";
    case "rupay":
      return "RuPay";
    case "discover":
      return "Discover";
    default:
      return "";
  }
};

const cardTypeLabel = (cardType: string | null | undefined): string => {
  switch (cardType) {
    case "credit_card":
      return "Credit Card";
    case "secured_credit_card":
      return "Secured Credit Card";
    case "co_brand":
      return "Co-brand Card";
    default:
      return "";
  }
};

/** Resolve a bank relationship (populated object or raw ID) to a display label.. */
const bankLabel = (
  bank: CardView["bank"],
  nameById: Map<string, string>,
): string => {
  if (!bank) return "";
  if (typeof bank === "object") return bank.name ?? "";
  return nameById.get(bank) ?? "";
};

const postJson = async (url: string, body: unknown): Promise<CardResponse> => {
  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return (await res.json().catch(() => ({}))) as CardResponse;
};

export const MyCards = () => {
  const [cards, setCards] = useState<CardView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add-card form state — the PAN lives in form state only while entering it.
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [bankId, setBankId] = useState("");
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [cardType, setCardType] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [saving, setSaving] = useState(false);

  // Revealed full PAN — kept only as long as the caller explicitly needs it.
  const [revealed, setRevealed] = useState<RevealData | null>(null);
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRevealed = useCallback(() => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    setRevealed(null);
  }, []);

  // Auto-clear the revealed PAN after a fixed window.
  useEffect(() => {
    if (revealed) {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(clearRevealed, REVEAL_CLEAR_MS);
    }
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [revealed, clearRevealed]);

  const loadCards = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/vault-cards?limit=100&sort=-updatedAt`,
        {
          credentials: "include",
        },
      );
      const data = (await res.json()) as { docs?: CardView[] };
      setCards(data.docs ?? []);
    } catch {
      setError("Could not load your cards.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Bank master options for the add-card dropdown — served by the secure card
  // API (GET /api/vault-cards/banks); the banks collection itself is not user-readable
  // (payload-gatekeeper restricts it to admin roles)..
  useEffect(() => {
    let cancelled = false;
    const loadBanks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/vault-cards/banks`, {
          credentials: "include",
        });
        const data = (await res.json().catch(() => ({}))) as {
          banks?: BankOption[];
        };
        if (!cancelled) {
          setBanks(
            Array.isArray(data.banks)
              ? data.banks.filter((b) => b?.id && b?.name)
              : [],
          );
        }
      } catch {
        if (!cancelled) setBanks([]);
      }
    };
    loadBanks();
    return () => {
      cancelled = true;
    };
  }, []);

  const bankNameById = useMemo(
    () => new Map(banks.map((b) => [b.id, b.name])),
    [banks],
  );

  const handleAdd = async () => {
    setError("");
    setNotice("");
    const month = Number(expiryMonth);
    const year = Number(expiryYear);
    try {
      setSaving(true);
      const data = await postJson("/api/vault-cards/add", {
        pan: cardNumber,
        cardholderName,
        expiryMonth: month,
        expiryYear: year,
        // The issuing bank cannot be detected from the PAN server-side (only
        // the network/brand can) — the user picks it from the bank master list.
        ...(bankId ? { bank: bankId } : {}),
        ...(cardType ? { cardType } : {}),
      });
      if (data.error) {
        setError(data.error);
        return;
      }
      setCardNumber("");
      setCardholderName("");
      setBankId("");
      setCardType("");
      setExpiryMonth("");
      setExpiryYear("");
      setNotice(
        "Card saved. Only the last four digits are stored in clear text.",
      );
      await loadCards(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReveal = async (id: string) => {
    setError("");
    setNotice("");
    clearRevealed();
    setRevealingId(id);
    try {
      const data = await postJson(
        `/api/vault-cards/${encodeURIComponent(id)}/reveal`,
        {},
      );
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.data) setRevealed(data.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRevealingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCardId) return;
    setIsDeleting(true);
    setError("");
    setNotice("");
    clearRevealed();
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/vault-cards/${encodeURIComponent(deleteCardId)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Could not delete the card.");
        return;
      }
      setNotice("Card deleted.");
      setDeleteCardId(null);
      await loadCards(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Breadcrumb Navigation */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.backLink}>
            <IconArrowLeft />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <header className={styles.header}>
          <div className={styles.securityBadge}>
            <IconUnlock />
            <span>PCI-DSS Compliant Vault · AES-256-GCM</span>
          </div>
          <h1 className={styles.title}>My Cards</h1>
          <p className={styles.subtitle}>
            Your card numbers are encrypted with hardware-grade AES-256-GCM at
            rest and are never shown in full unless you explicitly reveal them.
          </p>
        </header>

        {error && (
          <div className={styles.error} role="alert">
            <IconAlertCircle />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className={styles.notice} role="status">
            <IconCheckCircle />
            <span>{notice}</span>
          </div>
        )}

        {/* Add a Card Section */}
        <section className={styles.section} aria-label="Add a card">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <IconCreditCard />
              <span>Add a card</span>
            </h2>
          </div>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <label className={styles.field}>
              <span>Card number</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                className={styles.input}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Cardholder name</span>
              <input
                type="text"
                autoComplete="cc-name"
                className={styles.input}
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="e.g. JOHN DOE"
                required
              />
            </label>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>Bank</span>
                <select
                  className={styles.input}
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                >
                  <option value="">Not specified</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Card type</span>
                <select
                  className={styles.input}
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                >
                  <option value="">Not specified</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="secured_credit_card">
                    Secured Credit Card
                  </option>
                  <option value="co_brand">Co-brand Credit Card</option>
                </select>
              </label>
            </div>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>Expiry month</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={12}
                  className={styles.input}
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  placeholder="MM"
                  required
                />
              </label>
              <label className={styles.field}>
                <span>Expiry year</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={2000}
                  max={2199}
                  className={styles.input}
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  placeholder="YYYY"
                  required
                />
              </label>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className={styles.spinner}
                      style={{ width: 15, height: 15, borderWidth: 2 }}
                    />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <IconPlus />
                    <span>Save card to vault</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Saved Cards Section */}
        <section className={styles.section} aria-label="Saved cards">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span>Saved cards</span>
              <span className={styles.sectionBadge}>{cards.length}</span>
            </h2>
          </div>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p className={styles.muted}>Loading secure vault…</p>
            </div>
          ) : cards.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <IconCreditCard />
              </div>
              <p className={styles.emptyTitle}>No cards saved yet</p>
              <p className={styles.muted}>
                Add your first card above to securely store and optimize your
                rewards.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {cards.map((card) => (
                <li key={card.id} className={styles.cardItem}>
                  <div className={styles.cardTopRow}>
                    <span className={styles.cardNumber}>
                      {card.panMasked || "•••• •••• •••• ••••"}
                    </span>
                    <span className={styles.brandBadge}>
                      {brandLabel(card.brand) || "Card"}
                    </span>
                  </div>

                  <div className={styles.cardMeta}>
                    {card.nickname && (
                      <span className={styles.cardNickname}>
                        {card.nickname}
                      </span>
                    )}
                    {(bankLabel(card.bank, bankNameById) ||
                      cardTypeLabel(card.cardType)) && (
                      <span className={styles.cardBank}>
                        {[
                          bankLabel(card.bank, bankNameById),
                          cardTypeLabel(card.cardType),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                    <span className={styles.cardDetails}>
                      {card.expiryMonth && card.expiryYear
                        ? `Expires ${String(card.expiryMonth).padStart(2, "0")}/${card.expiryYear}`
                        : "No expiry stored"}
                    </span>
                    {revealed?.id === card.id && (
                      <div className={styles.revealedBox}>
                        <p className={styles.revealedPan}>{revealed.pan}</p>
                        <p className={styles.revealedName}>
                          {revealed.cardholderName} · Expires{" "}
                          {String(revealed.expiryMonth ?? "").padStart(2, "0")}/
                          {revealed.expiryYear ?? ""}
                        </p>
                        <p className={styles.revealedHint}>
                          <IconClock />
                          Auto-hidden after 20 seconds. Do not share this
                          number.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardBottomRow}>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => handleReveal(card.id)}
                        disabled={revealingId === card.id}
                      >
                        {revealed?.id === card.id ? (
                          <>
                            <IconEyeOff />
                            <span>Hide number</span>
                          </>
                        ) : revealingId === card.id ? (
                          <span>Revealing…</span>
                        ) : (
                          <>
                            <IconEye />
                            <span>Show full number</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => setDeleteCardId(card.id)}
                      >
                        <IconTrash />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteCardId)}
        onClose={() => {
          if (!isDeleting) setDeleteCardId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Card"
        message="Are you sure you want to delete this card? The encrypted card data will be permanently removed."
        confirmText="Delete Card"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
