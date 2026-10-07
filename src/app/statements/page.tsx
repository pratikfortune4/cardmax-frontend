import { StatementSyncClient } from "./StatementSyncClient";

export const metadata = {
  title: "Statement Sync - CardMax",
  description: "Sync your statements to find the right cards.",
};

export default function StatementsPage() {
  return <StatementSyncClient />;
}
