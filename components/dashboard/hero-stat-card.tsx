"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Round, RoundStats, StatCategory } from "@/lib/types";
import { calculateAggregateStats } from "@/lib/stats/calculate-stats";
import {
  getPerRoundChartData,
  isBetterThanPga,
  STAT_LABELS,
  STAT_DIRECTION,
  PGA_TOUR_AVERAGES,
  formatStat,
} from "@/lib/stat-helpers";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

interface HeroStatCardProps {
  stat: StatCategory;
  roundStats: Array<{ round: Round; stats: RoundStats }>;
  sortedRounds: Round[];
  roundFilter: number | "all";
  onRoundFilterChange: (filter: number | "all") => void;
}

const ROUND_FILTER_OPTIONS: { label: string; value: number | "all" }[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "All", value: "all" },
];

function CustomTooltip({
  active,
  payload,
  stat,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { date: string; value: number; pgaAverage: number };
  }>;
  stat: StatCategory;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  let dateLabel: string;
  try {
    dateLabel = format(new Date(data.date), "MMM d, yyyy");
  } catch {
    dateLabel = data.date;
  }
  return (
    <div className="rounded-lg border bg-background/95 backdrop-blur-sm px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground mb-1">{dateLabel}</p>
      <p className="font-medium">You: {formatStat(data.value, stat)}</p>
      <p className="text-blue-400">PGA: {formatStat(data.pgaAverage, stat)}</p>
    </div>
  );
}

export function HeroStatCard({
  stat,
  roundStats,
  sortedRounds,
  roundFilter,
  onRoundFilterChange,
}: HeroStatCardProps) {
  const [customInput, setCustomInput] = useState("");

  const lastN = roundFilter === "all" ? undefined : roundFilter;

  const chartData = useMemo(
    () => getPerRoundChartData(roundStats, stat, lastN),
    [roundStats, stat, lastN]
  );

  const aggregateStats = useMemo(
    () => calculateAggregateStats(sortedRounds, lastN),
    [sortedRounds, lastN]
  );

  const statValue = aggregateStats[stat as keyof typeof aggregateStats] as number;
  const formattedValue = formatStat(statValue, stat);
  const pgaAvg = PGA_TOUR_AVERAGES[stat];
  const formattedPga = pgaAvg !== undefined ? formatStat(pgaAvg, stat) : undefined;
  const betterThanPga = isBetterThanPga(statValue, stat);

  const GREEN = "hsl(160, 84%, 39%)";
  const RED = "hsl(0, 84%, 60%)";

  // Build horizontal gradient stops that switch green/red at PGA crossover points
  const colorStops = useMemo(() => {
    if (chartData.length < 2 || pgaAvg === undefined) {
      const c = betterThanPga ? GREEN : RED;
      return [{ offset: "0%", color: c }, { offset: "100%", color: c }];
    }
    const direction = STAT_DIRECTION[stat];
    const isBetter = (val: number) =>
      direction === "increase" ? val >= pgaAvg : val <= pgaAvg;
    const n = chartData.length - 1;
    const stops: { offset: string; color: string }[] = [];

    for (let i = 0; i <= n; i++) {
      const val = chartData[i].value;
      const better = isBetter(val);
      const color = better ? GREEN : RED;
      const pct = ((i / n) * 100).toFixed(2) + "%";

      if (i < n) {
        const nextVal = chartData[i + 1].value;
        const nextBetter = isBetter(nextVal);
        if (better !== nextBetter) {
          // Find exact crossing point via linear interpolation
          const t = (pgaAvg - val) / (nextVal - val);
          const crossPct = (((i + t) / n) * 100).toFixed(2) + "%";
          stops.push({ offset: pct, color });
          stops.push({ offset: crossPct, color });
          stops.push({ offset: crossPct, color: nextBetter ? GREEN : RED });
        } else {
          stops.push({ offset: pct, color });
        }
      } else {
        stops.push({ offset: pct, color });
      }
    }
    return stops;
  }, [chartData, pgaAvg, stat, betterThanPga]);

  // Color of the last data point (for activeDot)
  const lastColor = colorStops[colorStops.length - 1]?.color ?? GREEN;

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const values = chartData.map((d) => d.value);
    const allValues = pgaAvg !== undefined ? [...values, pgaAvg] : values;
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.15 || 1;
    return [min - padding, max + padding];
  }, [chartData, pgaAvg]);

  const isCustomActive =
    typeof roundFilter === "number" &&
    !ROUND_FILTER_OPTIONS.some((o) => o.value === roundFilter);

  return (
    <Card className="col-span-2 row-span-2">
      <CardContent className="pt-4 pb-4 px-4 sm:px-5 flex flex-col justify-between h-full">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {STAT_LABELS[stat]}
          </p>

          <div className="flex items-end gap-3 mt-2">
            <p className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight">
              {formattedValue}
            </p>
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium mb-1",
                betterThanPga ? "text-green-500" : "text-red-500"
              )}
            >
              {betterThanPga ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          </div>

          {formattedPga && (
            <p className="text-xs text-muted-foreground mt-1">
              PGA Tour avg: {formattedPga}
            </p>
          )}
        </div>

        <div>
          {/* Round filter pills */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {ROUND_FILTER_OPTIONS.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => {
                  onRoundFilterChange(option.value);
                  setCustomInput("");
                }}
                className={cn(
                  "px-2.5 py-0.5 text-xs rounded-full transition-colors",
                  roundFilter === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {option.label}
              </button>
            ))}
            <input
              type="number"
              min={1}
              placeholder="#"
              value={customInput}
              onChange={(e) => {
                const raw = e.target.value;
                setCustomInput(raw);
                const v = parseInt(raw, 10);
                if (v > 0) onRoundFilterChange(v);
              }}
              className={cn(
                "w-12 px-2 py-0.5 text-xs rounded-full text-center outline-none transition-colors",
                "bg-muted/60 text-muted-foreground placeholder:text-muted-foreground/50",
                "focus:ring-1 focus:ring-primary/50",
                isCustomActive &&
                  "ring-1 ring-primary bg-primary/10 text-foreground"
              )}
            />
          </div>

          {/* Dual-area chart with X and Y axes */}
          {chartData.length > 1 && (
            <div className="h-44 sm:h-56 mt-3 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 8, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={`pgaGradient-${stat}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(213, 55%, 63%)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(213, 55%, 63%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    {/* Horizontal gradient — switches green/red at PGA crossovers */}
                    <linearGradient
                      id={`trendStroke-${stat}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      {colorStops.map((s, i) => (
                        <stop
                          key={i}
                          offset={s.offset}
                          stopColor={s.color}
                        />
                      ))}
                    </linearGradient>
                    <linearGradient
                      id={`trendFill-${stat}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      {colorStops.map((s, i) => (
                        <stop
                          key={i}
                          offset={s.offset}
                          stopColor={s.color}
                          stopOpacity={0.15}
                        />
                      ))}
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date: string) => {
                      try {
                        return format(new Date(date), "M/d");
                      } catch {
                        return date;
                      }
                    }}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={30}
                  />
                  <YAxis
                    domain={yDomain}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    tickFormatter={(val: number) => formatStat(val, stat)}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  {pgaAvg !== undefined && (
                    <Area
                      type="monotone"
                      dataKey="pgaAverage"
                      stroke="hsl(213, 55%, 63%)"
                      strokeWidth={1.5}
                      strokeDasharray="6 3"
                      fill={`url(#pgaGradient-${stat})`}
                      dot={false}
                      activeDot={false}
                      isAnimationActive={false}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={`url(#trendStroke-${stat})`}
                    strokeWidth={2}
                    fill={`url(#trendFill-${stat})`}
                    dot={false}
                    activeDot={{ r: 4, fill: lastColor, strokeWidth: 0 }}
                  />
                  <Tooltip
                    content={<CustomTooltip stat={stat} />}
                    cursor={{
                      stroke: "var(--color-muted-foreground)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
