"use client";
import {
  IconStar,
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconCompass,
  IconShield,
  IconMail,
  IconCreditCard,
  IconPlus,
  IconActivity,
  IconClock,
  IconDollarSign,
} from "@/components/Icons";

import React, { useState } from "react";
import Link from "next/link";
import ShowMeTheMathsModal, {
  type RecommendationMathData,
} from "./ShowMeTheMathsModal";
import { AnalyticsSection } from "./AnalyticsSection";
import "@/app/home.scss";

import { API_BASE_URL } from "@/lib/api";

export interface DashboardData {
  user: {
    name: string;
    email: string;
    isPro: boolean;
  };
  metrics: {
    totalCards: number;
    activeCardsCount: number;
    totalCreditLimit: number;
    nextDue: {
      cardName?: string;
      dueDateFormatted?: string;
      daysRemaining?: number;
      hasUpcomingDue: boolean;
    };
  };
  gmailConnected: boolean;
  recommendations: {
    docs: Array<{
      category: string;
      categorySlug?: string;
      cardName?: string;
      icon: string;
      bestCard: string;
      multiplier: string;
      perkSummary: string;
      isOwned: boolean;
    }>;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  recentStatementsCount: number;
  analytics?: {
    creditLimits: Array<{ name: string; value: number }>;
    rewardMultipliers: Array<{
      cardName: string;
      value: number;
      type: "cashback" | "points";
    }>;
    spendAnalysis: {
      available: boolean;
      data: Array<{ month: string; spend: number }>;
    };
  };
}

const getCategoryIcon = (icon?: string): string => {
  if (!icon) return "💳";
  const iconMap: Record<string, string> = {
    utensils: "🍽️",
    dining: "🍽️",
    dinning: "🍽️",
    "dining & delivery": "🍽️",
    "dining & food delivery": "🍽️",
    "shopping-bag": "🛍️",
    shopping: "🛍️",
    "shopping & electronics": "🛍️",
    "online shopping": "🛍️",
    plane: "✈️",
    travel: "✈️",
    "travel & flights": "✈️",
    fuel: "⛽",
    "fuel surcharge": "⛽",
    groceries: "🥦",
    grocery: "🥦",
    "grocery & spends": "🥦",
    utilities: "⚡",
    "utility bills": "⚡",
    entertainment: "🍿",
    movies: "🍿",
  };
  return iconMap[icon.toLowerCase()] || icon;
};

export const DashboardView: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { user, metrics, gmailConnected, recommendations } = data;

  const [currentPage, setCurrentPage] = useState(recommendations.page || 1);
  const [totalPages, setTotalPages] = useState(recommendations.totalPages || 1);
  const [paginatedRecommendations, setPaginatedRecommendations] = useState(
    recommendations.docs || [],
  );
  const [isFetchingPage, setIsFetchingPage] = useState(false);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handlePageChange = async (direction: "prev" | "next") => {
    let newPage = currentPage;
    if (direction === "prev" && currentPage > 1) newPage = currentPage - 1;
    if (direction === "next" && currentPage < totalPages)
      newPage = currentPage + 1;

    if (newPage === currentPage) return;

    setIsFetchingPage(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/dashboard?page=${newPage}`,
        {
          credentials: "include",
        },
      );
      if (res.ok) {
        const json = await res.json();
        if (json.dashboard?.recommendations) {
          setPaginatedRecommendations(json.dashboard.recommendations.docs);
          setCurrentPage(json.dashboard.recommendations.page);
          setTotalPages(json.dashboard.recommendations.totalPages);
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              left: 0,
              behavior: "smooth",
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch next page", e);
    } finally {
      setIsFetchingPage(false);
    }
  };

  // Modal state — null means closed, otherwise holds the active recommendation
  const [activeMathRec, setActiveMathRec] =
    useState<RecommendationMathData | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const todayFormatted = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="cm-home-wrapper">
      <div className="cm-container">
        {/* Dashboard Header */}
        <header className="cm-dashboard-header">
          <div className="cm-greeting">
            <h1>Welcome back, {user.name}</h1>
            <p>{todayFormatted} &bull; Your CardMax Financial Overview</p>
          </div>
        </header>

        {/* 3-Card Metrics Grid */}
        <section
          className="cm-metrics-grid"
          aria-label="Wallet Overview Metrics"
        >
          {/* Card 1: Active Cards */}
          <div className="cm-metric-card cm-metric-card--primary">
            <div className="cm-metric-card__header">
              <span>Active Cards</span>
              <div className="cm-metric-icon cm-metric-icon--blue">
                <IconCreditCard />
              </div>
            </div>
            <div className="cm-metric-value">{metrics.activeCardsCount}</div>
            <div className="cm-metric-subtext">
              <span>{metrics.totalCards} cards linked in wallet</span>
            </div>
          </div>

          {/* Card 2: Total Credit Limit */}
          <div className="cm-metric-card cm-metric-card--success">
            <div className="cm-metric-card__header">
              <span>Total Credit Limit</span>
              <div className="cm-metric-icon cm-metric-icon--green">
                <IconDollarSign />
              </div>
            </div>
            <div className="cm-metric-value">
              {metrics.totalCreditLimit > 0
                ? formatCurrency(metrics.totalCreditLimit)
                : "₹0"}
            </div>
            <div className="cm-metric-subtext">
              <span>Aggregate purchasing capacity</span>
            </div>
          </div>

          {/* Card 3: Next Payment Due */}
          <div className="cm-metric-card cm-metric-card--warning">
            <div className="cm-metric-card__header">
              <span>Next Statement Due</span>
              <div className="cm-metric-icon cm-metric-icon--amber">
                <IconClock />
              </div>
            </div>
            <div className="cm-metric-value">
              {metrics.nextDue.hasUpcomingDue
                ? `${metrics.nextDue.daysRemaining} days`
                : "No Dues"}
            </div>
            <div className="cm-metric-subtext">
              {metrics.nextDue.hasUpcomingDue ? (
                <>
                  <span
                    className={`cm-badge-status ${metrics.nextDue.daysRemaining! <= 3 ? "cm-badge-status--urgent" : "cm-badge-status--good"}`}
                  >
                    {metrics.nextDue.dueDateFormatted}
                  </span>
                  <span>&bull; {metrics.nextDue.cardName}</span>
                </>
              ) : (
                <span>All statement payments clear</span>
              )}
            </div>
          </div>
          {/* Card 4: Total Spent This Month */}
          <div className="cm-metric-card cm-metric-card--purple">
            <div className="cm-metric-card__header">
              <span>Total Spent This Month</span>
              <div className="cm-metric-icon cm-metric-icon--purple">
                <IconActivity />
              </div>
            </div>
            <div className="cm-metric-value">₹0</div>
            <div className="cm-metric-subtext">
              <span className="cm-badge-status cm-badge-status--good">
                ↑ 0%
              </span>
              <span>&bull; vs last month</span>
            </div>
          </div>
        </section>

        {/* Quick Actions Bar - Slim Row */}
        <section aria-label="Quick Actions" className="cm-quick-actions-slim">
          <Link
            href="/wallet"
            className="cm-quick-action-chip"
            title="Link card to wallet"
          >
            <IconPlus />
            Add New Card
          </Link>
          <Link
            href="/wallet"
            className="cm-quick-action-chip"
            title={`View ${metrics.activeCardsCount} active cards`}
          >
            <IconCreditCard />
            Manage Wallet
          </Link>
          <Link
            href="/gmail"
            className="cm-quick-action-chip"
            title={gmailConnected ? "Connected & synced" : "Connect auto-sync"}
          >
            <IconMail />
            Gmail Statements
          </Link>
          <Link
            href="/settings/consent"
            className="cm-quick-action-chip"
            title="Privacy & permissions"
          >
            <IconShield />
            Consent Settings
          </Link>
        </section>

        {/* Body Grid: Recommendations Carousel */}
        <section className="cm-dashboard-body-grid">
          <div className="cm-recommendations-widget">
            <div className="cm-widget-header">
              <div className="cm-widget-title">
                <h3>
                  <IconCompass />
                  Best Card to Use This Month
                </h3>
              </div>
              <div className="cm-widget-controls">
                <div className="cm-scroll-arrows">
                  <button
                    type="button"
                    className="cm-scroll-btn"
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
                  <button
                    type="button"
                    className="cm-scroll-btn"
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
              </div>
            </div>

            <div className="cm-categories-scroll-wrapper">
              <div className="cm-categories-grid" ref={scrollContainerRef}>
                {paginatedRecommendations.map((rec, index) => {
                  const isTopPick = index === 0 && currentPage === 1;
                  const formatCategory = (str: string) =>
                    str
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ");
                  const categoryName = formatCategory(rec.category);
                  const isPremium = categoryName
                    .toLowerCase()
                    .includes("premium");
                  const isMid = categoryName.toLowerCase().includes("mid");

                  return (
                    <div
                      key={`${rec.category}-${index}`}
                      className="cm-category-card"
                    >
                      {isTopPick && (
                        <div className="cm-top-pick-ribbon">Top Pick</div>
                      )}
                      <div className="cm-cat-top">
                        <span className="cm-cat-title">
                          <span className="cm-cat-emoji">
                            {getCategoryIcon(rec.icon)}
                          </span>
                          <span>{categoryName}</span>
                          {isPremium && (
                            <span className="cm-tier-badge cm-tier-badge--premium">
                              Premium
                            </span>
                          )}
                          {isMid && (
                            <span className="cm-tier-badge cm-tier-badge--mid">
                              Mid
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="cm-cat-card-name">{rec.bestCard}</div>
                      <div className="cm-cat-multiplier-badge">
                        {rec.multiplier}
                      </div>

                      <div className="cm-cat-status">
                        {rec.isOwned ? (
                          <>
                            <IconCheck />
                            <span>In Your Wallet</span>
                          </>
                        ) : (
                          <>
                            <IconStar />
                            <span>Recommended</span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        className="cm-show-maths-btn"
                        id={`show-maths-${rec.category.replace(/\s+/g, "-").replace(/&/g, "and").toLowerCase()}`}
                        onClick={() =>
                          setActiveMathRec({
                            category: rec.category,
                            categorySlug: rec.categorySlug,
                            cardName: rec.cardName || rec.bestCard,
                            icon: getCategoryIcon(rec.icon),
                            bestCard: rec.bestCard,
                            multiplier: rec.multiplier,
                          })
                        }
                        aria-label={`Show the maths behind ${rec.category} recommendation`}
                      >
                        Show Me the Maths →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        {!data.analytics && (
          <div
            style={{
              padding: "1rem",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "8px",
              margin: "2rem 0",
            }}
          >
            <strong>Debug:</strong> No analytics data received from backend API.
            Please restart the Payload server.
          </div>
        )}
        {data.analytics && <AnalyticsSection analytics={data.analytics} />}
      </div>

      {/* ── Show Me the Maths Modal ───────────────────────────────────── */}
      {activeMathRec && (
        <ShowMeTheMathsModal
          recommendation={activeMathRec}
          onClose={() => setActiveMathRec(null)}
        />
      )}
    </div>
  );
};
