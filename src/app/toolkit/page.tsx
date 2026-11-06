import type { Metadata } from "next";
import { ToolkitApp } from "@/components/toolkit/app";

export const metadata: Metadata = {
  title: "Financial Reset Toolkit (Prototype)",
  description: "Money Coach Financial Reset Toolkit: net worth, paycheck, debt, emergency fund, investing, benefits and a 30-day reset in one dashboard.",
  // Stage 1 prototype: keep it out of search results until it launches.
  robots: { index: false, follow: false },
};

export default function ToolkitPage() {
  return <ToolkitApp />;
}
