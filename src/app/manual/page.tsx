import React from "react";
import { ManualSpendClient } from "./ManualSpendClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manual Spend Setup | CardMax",
  description: "Set up your manual spends for recommendations.",
};

export default function ManualSpendPage() {
  return <ManualSpendClient />;
}
