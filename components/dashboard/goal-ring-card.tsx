"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoalProgress } from "@/hooks/use-goal-progress";
import { STAT_LABELS } from "@/lib/constants";
import { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

function GoalRing({ goal }: { goal: Goal }) {
  const { progress } = useGoalProgress(goal);
  const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // SVG ring calculation
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 52 52">
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            className="stroke-foreground/5"
            strokeWidth="4"
          />
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            className="stroke-primary"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
          {clampedProgress.toFixed(0)}%
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate">
          {STAT_LABELS[goal.statCategory]}
        </p>
        <p className={cn(
          "text-[10px]",
          daysLeft < 0 ? "text-red-500" : "text-muted-foreground"
        )}>
          {daysLeft < 0 ? "Overdue" : `${daysLeft}d left`}
        </p>
      </div>
    </div>
  );
}

interface GoalRingCardProps {
  goals: Goal[];
}

export function GoalRingCard({ goals }: GoalRingCardProps) {
  if (goals.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          <Link
            href="/tactics/goals"
            className="text-xs text-primary hover:underline"
          >
            All goals
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.slice(0, 3).map((goal) => (
          <GoalRing key={goal.id} goal={goal} />
        ))}
        {goals.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{goals.length - 3} more
          </p>
        )}
      </CardContent>
    </Card>
  );
}
