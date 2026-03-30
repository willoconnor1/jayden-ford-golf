"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageBackground } from "@/components/layout/page-background";
import { StatCard } from "@/components/dashboard/stat-card";
import { HeroStatCard } from "@/components/dashboard/hero-stat-card";
import { SGBreakdownCard } from "@/components/dashboard/sg-breakdown-card";
import { GameRadarCard } from "@/components/dashboard/game-radar-card";
import { GoalRingCard } from "@/components/dashboard/goal-ring-card";
import { RecentRounds } from "@/components/dashboard/recent-rounds";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useStats } from "@/hooks/use-stats";
import { useHydration } from "@/hooks/use-hydration";
import { useRoundStore } from "@/stores/round-store";
import { useStrokesGained } from "@/hooks/use-strokes-gained";
import { useGoalStore } from "@/stores/goal-store";
import { useAuth } from "@/components/auth-provider";
import { StatCategory } from "@/lib/types";
import { DASHBOARD_STATS } from "@/lib/stat-helpers";

export default function DashboardPage() {
  const hydrated = useHydration();
  const { user } = useAuth();
  const rounds = useRoundStore((s) => s.rounds);
  const { aggregateStats, roundStats, sortedRounds } = useStats();
  const { sgAverages } = useStrokesGained();
  const goals = useGoalStore((s) => s.goals);
  const activeGoals = goals.filter((g) => !g.isCompleted);
  const firstName = user?.name?.split(" ")[0] ?? "Golfer";

  const [selectedStat, setSelectedStat] = useState<StatCategory>("scoringAverage");
  const [roundFilter, setRoundFilter] = useState<number | "all">("all");

  if (!hydrated) {
    return (
      <>
        <PageBackground image="/te-arai-north.jpg" />
        <div className="relative z-10 animate-pulse space-y-4">
          <div className="h-10 bg-muted/60 rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/60 rounded-2xl backdrop-blur-sm" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (rounds.length === 0) {
    return (
      <>
        <PageBackground image="/te-arai-north.jpg" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1
            className="text-5xl sm:text-6xl italic font-light mb-3 text-white drop-shadow-md"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Welcome, {firstName}
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-md drop-shadow-sm">
            Track your rounds, analyze your strokes gained, and get personalized
            practice plans to sharpen your game.
          </p>
          <Link href="/rounds/new" className={buttonVariants({ size: "lg" })}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Log Your First Round
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBackground image="/te-arai-north.jpg" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
              {firstName}&apos;s Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 drop-shadow-sm">
              {rounds.length} round{rounds.length === 1 ? "" : "s"} tracked
            </p>
          </div>
          <QuickActions />
        </div>

        {/* Stat cards — hero card + small cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <HeroStatCard
            key={selectedStat}
            stat={selectedStat}
            roundStats={roundStats}
            sortedRounds={sortedRounds}
            roundFilter={roundFilter}
            onRoundFilterChange={setRoundFilter}
          />
          {DASHBOARD_STATS.filter((s) => s !== selectedStat).map((stat) => (
            <StatCard
              key={stat}
              stat={stat}
              aggregateStats={aggregateStats}
              isSelected={false}
              onClick={() => setSelectedStat(stat)}
            />
          ))}
        </div>

        {/* Middle row: SG + Radar + Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
          {sgAverages && <SGBreakdownCard sgAverages={sgAverages} />}
          {sgAverages && <GameRadarCard sgAverages={sgAverages} />}
          {activeGoals.length > 0 && <GoalRingCard goals={activeGoals} />}
        </div>

        {/* Bottom: Recent Rounds */}
        <div className="mt-3 sm:mt-4">
          <RecentRounds rounds={sortedRounds} />
        </div>
      </div>
    </>
  );
}
