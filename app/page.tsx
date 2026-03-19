"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatGrid } from "@/components/dashboard/stat-grid";
import { RecentRounds } from "@/components/dashboard/recent-rounds";
import { useStats } from "@/hooks/use-stats";
import { useHydration } from "@/hooks/use-hydration";
import { useRoundStore } from "@/stores/round-store";

export default function DashboardPage() {
  const hydrated = useHydration();
  const rounds = useRoundStore((s) => s.rounds);
  const { aggregateStats, sortedRounds } = useStats();

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">&#9971;</div>
        <h1 className="text-2xl font-bold mb-2">Welcome, Jayden</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Track your rounds across the NZ PGA and Australasian tours, analyze
          your strokes gained vs PGA Tour averages, and get personalized
          practice plans to sharpen your game.
        </p>
        <Link href="/rounds/new" className={buttonVariants({ size: "lg" })}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Log Your First Round
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Jayden's Dashboard"
        description={`${rounds.length} round${rounds.length === 1 ? "" : "s"} tracked | NZ PGA & Australasian Tour`}
      >
        <Link href="/rounds/new" className={buttonVariants()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Round
        </Link>
      </PageHeader>

      <div className="space-y-6">
        <StatGrid stats={aggregateStats} />
        <RecentRounds rounds={sortedRounds} />
      </div>
    </>
  );
}
