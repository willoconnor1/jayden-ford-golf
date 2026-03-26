"use client";

import { PageHeader } from "@/components/layout/page-header";
import { RoundEntryWizard } from "@/components/round-entry/round-entry-wizard";

export default function NewRoundPage() {
  return (
    <>
      <PageHeader title="Log New Round" description="Enter your hole-by-hole data" />
      <RoundEntryWizard />
    </>
  );
}
