"use client";
import { IconTrendingUp } from '@/components/Icons';

import React from "react";
import { CreditLimitChart } from "./charts/CreditLimitChart";
import { RewardMultiplierChart } from "./charts/RewardMultiplierChart";
import { SpendAnalysisChart } from "./charts/SpendAnalysisChart";
import { DashboardData } from "@/types";

interface AnalyticsSectionProps {
  analytics: DashboardData["analytics"];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  analytics,
}) => {
  return (
    <section className="cm-analytics-section" aria-label="Dashboard Analytics">
      <div className="cm-section-title">
        <h2>
          <IconTrendingUp width="20" height="20" />
          Analytics & Insights
        </h2>
      </div>

      <div className="cm-analytics-grid">
        {/* Chart 1: Spend Analysis */}
        <div className="cm-analytics-card">
          <div className="cm-analytics-card-header">
            <h3>Monthly Spending</h3>
            <p>Your statement aggregation</p>
          </div>
          <SpendAnalysisChart
            available={analytics.spendAnalysis?.available ?? false}
            data={analytics.spendAnalysis?.data ?? []}
          />
        </div>

        {/* Chart 2: Credit Limit Distribution */}
        <div className="cm-analytics-card">
          <div className="cm-analytics-card-header">
            <h3>Credit Limit Distribution</h3>
            <p>Wallet capacity across active cards</p>
          </div>
          <CreditLimitChart data={analytics.creditLimits ?? []} />
        </div>

        {/* Chart 3: Reward Comparison */}
        <div className="cm-analytics-card">
          <div className="cm-analytics-card-header">
            <h3>Recommendation Rewards</h3>
            <p>Top multipliers on recommended cards</p>
          </div>
          <RewardMultiplierChart data={analytics.rewardMultipliers ?? []} />
        </div>
      </div>
    </section>
  );
};
