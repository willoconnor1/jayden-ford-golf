"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DispersionStats } from "@/lib/stats/dispersion";
import { useDistanceUnit } from "@/hooks/use-distance-unit";

interface StatCardsRowProps {
  stats: DispersionStats;
  showDistance?: boolean;
}

export function StatCardsRow({ stats, showDistance = true }: StatCardsRowProps) {
  const { dFeet, dYards, fLabel, yLabel } = useDistanceUnit();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatCard label="Avg Miss" value={`${dFeet(stats.avgMissDistance).toFixed(1)}${fLabel}`} />
      <StatCard label="80% Radius" value={`${dFeet(stats.dispersionRadius80).toFixed(1)}${fLabel}`} />
      <StatCard
        label="Tendency"
        value={`${dFeet(Math.abs(stats.avgMissX)).toFixed(1)}${fLabel} ${stats.avgMissX >= 0 ? "R" : "L"}, ${dFeet(Math.abs(stats.avgMissY)).toFixed(1)}${fLabel} ${stats.avgMissY >= 0 ? "long" : "short"}`}
      />
      <StatCard label="Miss Left" value={`${stats.pctLeft.toFixed(0)}%`} />
      <StatCard label="Miss Right" value={`${stats.pctRight.toFixed(0)}%`} />
      {showDistance && (
        <StatCard label="Avg Target" value={`${dYards(stats.avgTargetDistance).toFixed(0)} ${yLabel}`} />
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
