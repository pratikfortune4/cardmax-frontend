import { API_BASE_URL } from "@/lib/api";

export interface StatementSyncProfile {
  monthlySpend: string;
  fdSpend: string;
  employmentType: string;
  portfolioSize: string;
  loungeAccess: string;
  fullName: string;
  dob: string;
  mobileNumber: string;
  primaryRewardGoals: string[];
  banksUsed: string[];
}

export interface StatementSyncPayload {
  periodMonths: number;
  source: "gmail" | "upload";
  profile: StatementSyncProfile;
  files?: File[]; // if upload
}

export const syncStatements = async (payload: StatementSyncPayload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/gmail/sync-statements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        period_months: payload.periodMonths,
        // Optionally send profile if backend can use it, but for now just send period
      }),
      credentials: "include",
    });

    const json = await res.json();

    if (res.ok) {
      const data = json.data || {};
      
      return {
        success: true,
        data: {
          statement_count: data.statement_count || 0,
          message_count: data.message_count || 0,
          skipped_reason: data.skipped_reason || "Some attachments were skipped based on bank rules.",
          statements_metadata: (data.statements_metadata || [])
            .filter((meta: any) => meta.included)
            .map((meta: any, idx: number) => ({
              id: meta.id || String(idx),
              bank_slug: meta.bank_slug || meta.sender_domain || "Unknown",
              filename: meta.filename,
              status: "UNLOCKED", // assume unlocked if parsed
            })),
        }
      };
    }
    
    throw new Error(json.error?.message || json.error || "Failed to sync statements");
  } catch (error: any) {
    console.error("Error in syncStatements:", error);
    throw new Error(error.message || "Network error occurred");
  }
}

// ----------------------------------------------------
// MANUAL SPEND JOURNEY
// ----------------------------------------------------

export interface ManualSpendPayload {
  profile: StatementSyncProfile;
  fuelPreference: string;
  vectorValues: Record<string, number>;
  selectedCards: string[];
}

export async function submitManualSpends(
  payload: ManualSpendPayload
): Promise<{ success: boolean; matrixId: string }> {
  // PLACEHOLDER ENDPOINT
  // const response = await fetch(`${API_BASE_URL}/manual-spends/submit`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();

  // Mock fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, matrixId: "mock-matrix-123" });
    }, 1500);
  });
};
