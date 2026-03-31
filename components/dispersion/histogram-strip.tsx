"use client";

import { useMemo } from "react";
import { EnrichedTeeShot, computeHistogramBins } from "@/lib/stats/dispersion";
import { Club } from "@/lib/types";
import { CLUB_COLORS, CLUBS } from "@/lib/constants-clubs";
import { useDistanceUnit } from "@/hooks/use-distance-unit";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface HistogramStripProps {
  shots: EnrichedTeeShot[];
  selectedClubs: Club[];
}

export function HistogramStrip({ shots, selectedClubs }: HistogramStripProps) {
  const { fLabel } = useDistanceUnit();
  const bins = useMemo(() => computeHistogramBins(shots, 10), [shots]);

  const chartData = useMemo(() => {
    return bins.map((bin) => ({
      name:
        bin.rangeStart >= 0
          ? `${bin.rangeStart}–${bin.rangeEnd}`
          : `${bin.rangeStart}–${bin.rangeEnd}`,
      label:
        bin.rangeStart >= 0
          ? `${bin.rangeStart}R`
          : `${Math.abs(bin.rangeEnd)}L`,
      ...bin.clubCounts,
      total: bin.total,
      rangeStart: bin.rangeStart,
    }));
  }, [bins]);

  // Clubs that actually appear in the data
  const clubsInData = useMemo(() => {
    const set = new Set<Club>();
    for (const shot of shots) set.add(shot.club);
    return selectedClubs.filter((c) => set.has(c));
  }, [shots, selectedClubs]);

  if (chartData.length === 0) return null;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
            label={{
              value: `← Left (${fLabel}) | Right (${fLabel}) →`,
              position: "bottom",
              offset: 0,
              style: { fontSize: 10, fill: "rgba(255,255,255,0.5)" },
            }}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
            allowDecimals={false}
          />
          <ReferenceLine x="0R" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "11px",
            }}
            formatter={(value: number, name: string) => {
              const label = CLUBS.find((c) => c.value === name)?.label ?? name;
              return [value, label];
            }}
          />
          {clubsInData.map((club) => (
            <Bar
              key={club}
              dataKey={club}
              stackId="clubs"
              fill={CLUB_COLORS[club]}
              fillOpacity={0.8}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
