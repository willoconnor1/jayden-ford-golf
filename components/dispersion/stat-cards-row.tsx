"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DispersionStats } from "@/lib/stats/dispersion";

interface StatCardsRowProps {
  stats: DispersionStats;
  showDistance?: boolean;
}

export function StatCardsRow({ stats, showDistance = true }: StatCardsRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatCard label="Avg Miss" value={`${stats.avgMissDistance.toFixed(1)}ft`} />
      <StatCard label="80% Radius" value={`${stats.dispersionRadius80.toFixed(1)}ft`} />
      <StatCard
        label="Tendency"
        value={`${Math.abs(stats.avgMissX).toFixed(1)}ft ${stats.avgMissX >= 0 ? "R" : "L"}, ${Math.abs(stats.avgMissY).toFixed(1)}ft ${stats.avgMissY >= 0 ? "long" : "short"}`}
      />
      <StatCard label="Miss Left" value={`${stats.pctLeft.toFixed(0)}%`} />
      <StatCard label="Miss Right" value={`${stats.pctRight.toFixed(0)}%`} />
      {showDistance && (
        <StatCard label="Avg Target" value={`${stats.avgTargetDistance.toFixed(0)} yds`} />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-3 px-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
