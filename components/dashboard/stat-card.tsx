"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  comparison?: string;
  trend?: "up" | "down" | "neutral";
  trendIsGood?: boolean;
}

export function StatCard({
  label,
  value,
  comparison,
  trend,
  trendIsGood,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <div className="flex items-end justify-between mt-1">
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trendIsGood ? "text-green-600" : "text-red-500",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
        {comparison && (
          <p className="text-xs text-muted-foreground mt-1">
            PGA Tour: {comparison}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
