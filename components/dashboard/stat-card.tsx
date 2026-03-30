"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AggregateStats, StatCategory } from "@/lib/types";
import {
  getAggregateValue,
  getFormattedValue,
  getFormattedPga,
  isBetterThanPga,
  STAT_LABELS,
} from "@/lib/stat-helpers";

interface StatCardProps {
  stat: StatCategory;
  aggregateStats: AggregateStats;
  isSelected?: boolean;
  onClick: () => void;
}

export function StatCard({
  stat,
  aggregateStats,
  isSelected,
  onClick,
}: StatCardProps) {
  const value = getAggregateValue(aggregateStats, stat);
  const formattedValue = getFormattedValue(aggregateStats, stat);
  const formattedPga = getFormattedPga(stat);
  const trendIsGood = isBetterThanPga(value, stat);
  const TrendIcon = trendIsGood ? TrendingUp : TrendingDown;

  return (
    <Card
      className={cn(
        "cursor-pointer hover:scale-[1.02] hover:ring-1 hover:ring-primary/30 transition-all duration-200",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className="pt-3 pb-2.5 px-3 sm:pt-4 sm:pb-3 sm:px-4">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
          {STAT_LABELS[stat]}
        </p>
        <div className="flex items-end justify-between mt-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            {formattedValue}
          </p>
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trendIsGood ? "text-green-500" : "text-red-500"
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
          </div>
        </div>
        {formattedPga && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
            PGA: {formattedPga}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
