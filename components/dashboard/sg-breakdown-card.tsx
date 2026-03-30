"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SGBreakdownCardProps {
  sgAverages: {
    sgOffTheTee: number;
    sgApproach: number;
    sgAroundTheGreen: number;
    sgPutting: number;
    sgTotal: number;
  };
}

const SG_ITEMS = [
  { key: "sgOffTheTee" as const, label: "Off the Tee" },
  { key: "sgApproach" as const, label: "Approach" },
  { key: "sgAroundTheGreen" as const, label: "Short Game" },
  { key: "sgPutting" as const, label: "Putting" },
];

export function SGBreakdownCard({ sgAverages }: SGBreakdownCardProps) {
  const maxAbs = Math.max(
    ...SG_ITEMS.map((item) => Math.abs(sgAverages[item.key])),
    0.5
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Strokes Gained</CardTitle>
          <Link
            href="/insights/strokes-gained"
            className="text-xs text-primary hover:underline"
          >
            Details
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {SG_ITEMS.map((item) => {
          const val = sgAverages[item.key];
          const barWidth = Math.min((Math.abs(val) / maxAbs) * 100, 100);
          const isPositive = val >= 0;

          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span
                  className={cn(
                    "font-bold tabular-nums",
                    isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  {val > 0 ? "+" : ""}
                  {val.toFixed(2)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isPositive ? "bg-green-500/70" : "bg-red-500/70"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs font-medium">Total</span>
          <span
            className={cn(
              "font-bold tabular-nums text-sm",
              sgAverages.sgTotal >= 0 ? "text-green-500" : "text-red-500"
            )}
          >
            {sgAverages.sgTotal > 0 ? "+" : ""}
            {sgAverages.sgTotal.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
