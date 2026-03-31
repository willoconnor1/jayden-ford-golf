"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Club, Round, ShotData } from "@/lib/types";
import {
  collectShots,
  calculateDispersion,
  collectTeeShots,
  getUsedClubs,
  DispersionStats,
  EnrichedTeeShot,
} from "@/lib/stats/dispersion";
import { CLUB_COLORS } from "@/lib/constants-clubs";
import { cn } from "@/lib/utils";
import { useDistanceUnit } from "@/hooks/use-distance-unit";

// Default 5 slots: LW, PW, 8i, 5i, Driver
const DEFAULT_SLOTS: { value: Club; label: string }[] = [
  { value: "lw", label: "LW" },
  { value: "pw", label: "PW" },
  { value: "8-iron", label: "8i" },
  { value: "5-iron", label: "5i" },
  { value: "driver", label: "DR" },
];

// Clubs available to swap into a slot (grouped by category)
const SWAPPABLE_CLUBS: { value: Club; label: string }[] = [
  { value: "driver", label: "DR" },
  { value: "3-wood", label: "3W" },
  { value: "5-wood", label: "5W" },
  { value: "3-hybrid", label: "3H" },
  { value: "4-hybrid", label: "4H" },
  { value: "5-hybrid", label: "5H" },
  { value: "3-iron", label: "3i" },
  { value: "4-iron", label: "4i" },
  { value: "5-iron", label: "5i" },
  { value: "6-iron", label: "6i" },
  { value: "7-iron", label: "7i" },
  { value: "8-iron", label: "8i" },
  { value: "9-iron", label: "9i" },
  { value: "pw", label: "PW" },
  { value: "gw", label: "GW" },
  { value: "sw", label: "SW" },
  { value: "lw", label: "LW" },
];

const DRIVER_CLUBS = new Set<Club>(["driver", "3-wood", "5-wood", "7-wood"]);

interface DispersionCardProps {
  rounds: Round[];
}

export function DispersionCard({ rounds }: DispersionCardProps) {
  const { dFeet, dYards, fLabel, yLabelShort } = useDistanceUnit();
  const usedClubs = useMemo(() => new Set(getUsedClubs(rounds)), [rounds]);
  const [slots, setSlots] = useState<Club[]>(DEFAULT_SLOTS.map((s) => s.value));
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  // Precompute all shot data per club across all slots
  const slotData = useMemo(() => {
    return slots.map((club) => {
      if (DRIVER_CLUBS.has(club)) {
        const teeShots = collectTeeShots(rounds, [club]);
        const stats = calculateDispersion(teeShots);
        return { club, teeShots, shots: [] as ShotData[], stats, isFairway: true };
      }
      const shots = collectShots(rounds, club);
      const stats = calculateDispersion(shots);
      return { club, teeShots: [] as EnrichedTeeShot[], shots, stats, isFairway: false };
    });
  }, [rounds, slots]);

  const hasAnyData = slotData.some((d) => d.stats !== null);
  if (!hasAnyData && usedClubs.size === 0) return null;

  const handleSwap = (slotIndex: number, newClub: Club) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = newClub;
      return next;
    });
    setEditingSlot(null);
  };

  const availableSwaps = SWAPPABLE_CLUBS.filter((c) => usedClubs.has(c.value));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Shot Dispersion</CardTitle>
          <Link
            href="/insights/dispersion"
            className="text-xs text-primary hover:underline"
          >
            View All
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {slotData.map((data, i) => {
            const label =
              SWAPPABLE_CLUBS.find((c) => c.value === data.club)?.label ??
              data.club;

            return (
              <div key={`${data.club}-${i}`} className="flex flex-col items-center">
                {/* Club pill — click to swap */}
                <button
                  onClick={() =>
                    setEditingSlot(editingSlot === i ? null : i)
                  }
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors border mb-1.5",
                    editingSlot === i
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/60 text-muted-foreground border-border hover:bg-card/80"
                  )}
                >
                  {label}
                </button>

                {/* Swap dropdown */}
                {editingSlot === i && (
                  <div className="absolute z-20 mt-6 bg-popover border rounded-lg shadow-lg p-1.5 flex flex-wrap gap-1 max-w-[180px]">
                    {availableSwaps.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => handleSwap(i, c.value)}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors",
                          c.value === data.club
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card/60 text-muted-foreground border-border hover:bg-card/80"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Mini visualization */}
                {data.stats === null ? (
                  <div className="w-full aspect-[3/4] flex items-center justify-center">
                    <span className="text-[9px] text-muted-foreground/50">
                      No data
                    </span>
                  </div>
                ) : data.isFairway ? (
                  <MiniFairway
                    shots={data.teeShots}
                    color={CLUB_COLORS[data.club]}
                  />
                ) : (
                  <MiniScatter
                    shots={data.shots}
                    stats={data.stats}
                    color={CLUB_COLORS[data.club]}
                  />
                )}

                {/* Stat underneath — only for non-fairway clubs */}
                {data.stats && !data.isFairway && (
                  <p className="text-[10px] tabular-nums text-muted-foreground mt-1">
                    {dFeet(data.stats.avgMissDistance).toFixed(0)}{fLabel} avg
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Mini circular scatter (irons/wedges) ────────────────────────

function MiniScatter({
  shots,
  stats,
  color,
}: {
  shots: ShotData[];
  stats: DispersionStats;
  color: string;
}) {
  const size = 120;
  const c = size / 2;
  const maxRange = 40;
  const s = (val: number) => c + (val / maxRange) * (c - 8);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full aspect-square">
      {/* Grid circle */}
      <circle
        cx={c}
        cy={c}
        r={c - 8}
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        strokeDasharray="2 2"
        opacity="0.25"
      />
      {/* Crosshair */}
      <line x1={8} y1={c} x2={size - 8} y2={c} stroke="white" strokeWidth="0.5" opacity="0.25" />
      <line x1={c} y1={8} x2={c} y2={size - 8} stroke="white" strokeWidth="0.5" opacity="0.25" />
      {/* Target dot */}
      <circle cx={c} cy={c} r="3" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
      {/* Shot dots — max 40 */}
      {shots.slice(0, 40).map((shot, i) => (
        <circle
          key={i}
          cx={s(shot.missX)}
          cy={s(-shot.missY)}
          r="2"
          fill={color}
          fillOpacity="0.55"
        />
      ))}
      {/* Average miss ring */}
      <circle
        cx={s(stats.avgMissX)}
        cy={s(-stats.avgMissY)}
        r="3.5"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.2"
      />
    </svg>
  );
}

// ── Mini fairway strip (driver/woods) ───────────────────────────

function MiniFairway({
  shots,
  color,
}: {
  shots: EnrichedTeeShot[];
  color: string;
}) {
  const { dYards, dFeet, fLabel, yLabelShort } = useDistanceUnit();
  const width = 120;
  const height = 150;
  const pad = { top: 10, bottom: 22, left: 22, right: 6 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  // Tight Y range around actual data — use 5th/95th percentile to ignore outliers
  const distances = shots.map((s) => s.distanceHit).sort((a, b) => a - b);
  const p5 = distances[Math.floor(distances.length * 0.05)] ?? distances[0];
  const p95 = distances[Math.ceil(distances.length * 0.95) - 1] ?? distances[distances.length - 1];
  const span = Math.max(20, p95 - p5);
  const padding = span * 0.15;
  // Round to nice 10-yard increments
  const yMin = Math.floor((p5 - padding) / 10) * 10;
  const yMax = Math.ceil((p95 + padding) / 10) * 10;
  const yRange: [number, number] = [yMin, yMax];

  const maxAbsX = Math.max(30, ...shots.map((s) => Math.abs(s.missX)));
  const xRange: [number, number] = [-maxAbsX * 1.1, maxAbsX * 1.1];

  const toX = (ft: number) =>
    pad.left + ((ft - xRange[0]) / (xRange[1] - xRange[0])) * innerW;
  const toY = (yds: number) =>
    height - pad.bottom - ((yds - yRange[0]) / (yRange[1] - yRange[0])) * innerH;

  const centerX = toX(0);
  const roughW = innerW * 0.08;

  // Y-axis grid lines at nice intervals
  const yStep = span <= 40 ? 10 : 25;
  const yLines: number[] = [];
  for (let v = Math.ceil(yRange[0] / yStep) * yStep; v <= yRange[1]; v += yStep) {
    yLines.push(v);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full aspect-[6/7]">
      {/* Fairway bg */}
      <rect
        x={pad.left}
        y={pad.top}
        width={innerW}
        height={innerH}
        rx={6}
        fill="rgba(74, 222, 128, 0.12)"
      />
      {/* Rough edges */}
      <rect
        x={pad.left}
        y={pad.top}
        width={roughW}
        height={innerH}
        rx={6}
        fill="rgba(34, 120, 50, 0.15)"
      />
      <rect
        x={width - pad.right - roughW}
        y={pad.top}
        width={roughW}
        height={innerH}
        rx={6}
        fill="rgba(34, 120, 50, 0.15)"
      />
      {/* Center line */}
      <line
        x1={centerX}
        y1={pad.top}
        x2={centerX}
        y2={height - pad.bottom}
        stroke="white"
        strokeWidth="0.5"
        opacity="0.2"
      />
      {/* Y-axis distance labels */}
      {yLines.map((v) => (
        <g key={v}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={toY(v)}
            y2={toY(v)}
            stroke="white"
            strokeWidth="0.4"
            opacity="0.12"
            strokeDasharray="2 2"
          />
          <text
            x={pad.left - 3}
            y={toY(v) + 3}
            textAnchor="end"
            fontSize="7"
            fill="white"
            fillOpacity="0.45"
          >
            {dYards(v)}{yLabelShort}
          </text>
        </g>
      ))}
      {/* X-axis: 4 labels + dotted vertical guide lines */}
      {(() => {
        const half = Math.round(maxAbsX);
        const midHalf = Math.round(half / 2);
        const labels = [
          { ft: -half, text: `${dYards(Math.round(half / 3))}${yLabelShort}` },
          { ft: -midHalf, text: `${dYards(Math.round(midHalf / 3))}${yLabelShort}` },
          { ft: midHalf, text: `${dYards(Math.round(midHalf / 3))}${yLabelShort}` },
          { ft: half, text: `${dYards(Math.round(half / 3))}${yLabelShort}` },
        ];
        return labels.map((l) => (
          <g key={`xl-${l.ft}`}>
            <line
              x1={toX(l.ft)}
              x2={toX(l.ft)}
              y1={pad.top}
              y2={height - pad.bottom}
              stroke="white"
              strokeWidth="0.4"
              opacity="0.15"
              strokeDasharray="2 2"
            />
            <text
              x={toX(l.ft)}
              y={height - pad.bottom + 11}
              textAnchor="middle"
              fontSize="6"
              fill="white"
              fillOpacity="0.4"
            >
              {l.text}
            </text>
          </g>
        ));
      })()}
      {/* Shot dots — max 40 */}
      {shots.slice(0, 40).map((shot, i) => (
        <circle
          key={i}
          cx={toX(shot.missX)}
          cy={toY(shot.distanceHit)}
          r="2"
          fill={color}
          fillOpacity="0.65"
          stroke="white"
          strokeWidth="0.3"
        />
      ))}
    </svg>
  );
}
