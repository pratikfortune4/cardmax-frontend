import React from "react";
import { Metadata } from "next";
import { ManualSpendClient } from "./ManualSpendClient";

export const metadata: Metadata = {
  title: "Manual Spend Setup | CardMax",
  description: "Set up your manual spends for recommendations.",
};

export default function ManualSpendPage() {
  return <ManualSpendClient />;
}
