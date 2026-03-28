"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { StatGrid } from "@/components/dashboard/stat-grid";
import { RecentRounds } from "@/components/dashboard/recent-rounds";
import { useStats } from "@/hooks/use-stats";
import { useHydration } from "@/hooks/use-hydration";
import { useRoundStore } from "@/stores/round-store";
import { useStrokesGained } from "@/hooks/use-strokes-gained";
import { useGoalStore } from "@/stores/goal-store";
import { useGoalProgress } from "@/hooks/use-goal-progress";
import { STAT_LABELS, formatStat } from "@/lib/constants";
import { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import { useAuth } from "@/components/auth-provider";

function DashboardGoalCard({ goal }: { goal: Goal }) {
  const { currentValue, progress } = useGoalProgress(goal);
  const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs font-medium truncate">
            {STAT_LABELS[goal.statCategory]}
          </p>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {daysLeft < 0 ? "Overdue" : `${daysLeft}d left`}
          </span>
        </div>
        <Progress value={Math.max(0, Math.min(100, progress))} className="h-1.5" />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>{formatStat(currentValue, goal.statCategory)}</span>
          <span>{formatStat(goal.targetValue, goal.statCategory)}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const hydrated = useHydration();
  const { user } = useAuth();
  const rounds = useRoundStore((s) => s.rounds);
  const { aggregateStats, sortedRounds } = useStats();
  const { sgAverages } = useStrokesGained();
  const goals = useGoalStore((s) => s.goals);
  const activeGoals = goals.filter((g) => !g.isCompleted);
  const firstName = user?.name?.split(" ")[0] ?? "Golfer";

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
        <div className="text-4xl mb-4 text-muted-foreground">—</div>
        <h1 className="text-2xl font-bold mb-2">Welcome, {firstName}</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Track your rounds, analyze your strokes gained, and get personalized
          practice plans to sharpen your game.
        </p>
        <Link href="/rounds/new" className={buttonVariants({ size: "lg" })}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Log Your First Round
        </Link>
      </div>
    );
  }

  const sgItems = sgAverages
    ? [
        { label: "Tee", value: sgAverages.sgOffTheTee },
        { label: "Approach", value: sgAverages.sgApproach },
        { label: "Short Game", value: sgAverages.sgAroundTheGreen },
        { label: "Putting", value: sgAverages.sgPutting },
        { label: "Total", value: sgAverages.sgTotal },
      ]
    : [];

  return (
    <>
      <PageHeader
        title={`${firstName}'s Dashboard`}
        description={`${rounds.length} round${rounds.length === 1 ? "" : "s"} tracked`}
      >
        <Link href="/rounds/new" className={buttonVariants()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Round
        </Link>
      </PageHeader>

      <div className="space-y-6">
        <StatGrid stats={aggregateStats} />

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <RecentRounds rounds={sortedRounds} />

          <div className="space-y-4 sm:space-y-6">
            {/* Strokes Gained Summary */}
            {sgAverages && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Strokes Gained</CardTitle>
                    <Link
                      href="/strokes-gained"
                      className="text-sm text-primary hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sgItems.map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "flex items-center justify-between py-1",
                        item.label === "Total" && "border-t pt-2 mt-1"
                      )}
                    >
                      <span className={cn(
                        "text-sm",
                        item.label === "Total" && "font-medium"
                      )}>
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "font-bold tabular-nums text-sm",
                          item.value >= 0 ? "text-green-600" : "text-red-500"
                        )}
                      >
                        {item.value > 0 ? "+" : ""}
                        {item.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Active Goals</CardTitle>
                    <Link
                      href="/goals"
                      className="text-sm text-primary hover:underline"
                    >
                      All goals
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeGoals.slice(0, 3).map((goal) => (
                    <DashboardGoalCard key={goal.id} goal={goal} />
                  ))}
                  {activeGoals.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{activeGoals.length - 3} more
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
