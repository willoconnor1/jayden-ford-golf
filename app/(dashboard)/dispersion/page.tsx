"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PageBackground } from "@/components/layout/page-background";
import { useRoundStore } from "@/stores/round-store";
import { useHydration } from "@/hooks/use-hydration";
import { Club, ShotLie } from "@/lib/types";
import { CLUBS, SHOT_LIES } from "@/lib/constants-clubs";
import {
  collectShots,
  calculateDispersion,
  getUsedClubs,
  getUsedLies,
} from "@/lib/stats/dispersion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

export default function DispersionPage() {
  const hydrated = useHydration();
  const rounds = useRoundStore((s) => s.rounds);
  const [clubFilter, setClubFilter] = useState<Club | "all">("all");
  const [lieFilter, setLieFilter] = useState<ShotLie | "all">("all");

  const usedClubs = useMemo(() => getUsedClubs(rounds), [rounds]);
  const usedLies = useMemo(() => getUsedLies(rounds), [rounds]);

  const shots = useMemo(
    () => collectShots(rounds, clubFilter, lieFilter),
    [rounds, clubFilter, lieFilter]
  );
  const stats = useMemo(() => calculateDispersion(shots), [shots]);

  const scatterData = useMemo(
    () => shots.map((s) => ({ x: s.missX, y: s.missY, club: s.club, lie: s.lie })),
    [shots]
  );

  if (!hydrated) {
    return (
      <>
        <PageBackground image="/te-arai-south.jpg" />
        <div className="relative z-10 animate-pulse space-y-4">
          <div className="h-8 bg-muted/60 rounded w-48" />
          <div className="h-64 bg-muted/60 rounded-lg" />
        </div>
      </>
    );
  }

  const hasShots = usedClubs.length > 0;

  return (
    <>
      <PageBackground image="/te-arai-south.jpg" />
      <div className="relative z-10">
      <PageHeader
        title="Shot Dispersion"
        description="Analyze where your shots miss relative to your target"
      />

      {!hasShots ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-lg font-semibold mb-2">No shot data yet</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              When entering a round, expand the &quot;More&quot; section on each
              hole and click &quot;Track shots&quot; to record where each shot
              lands relative to your target.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="space-y-3">
            {/* Club filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">
                Club
              </label>
              <div className="flex flex-wrap gap-1.5">
                <FilterPill
                  active={clubFilter === "all"}
                  onClick={() => setClubFilter("all")}
                >
                  All
                </FilterPill>
                {CLUBS.filter((c) => usedClubs.includes(c.value)).map((c) => (
                  <FilterPill
                    key={c.value}
                    active={clubFilter === c.value}
                    onClick={() => setClubFilter(c.value)}
                  >
                    {c.label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Lie filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">
                Lie
              </label>
              <div className="flex flex-wrap gap-1.5">
                <FilterPill
                  active={lieFilter === "all"}
                  onClick={() => setLieFilter("all")}
                >
                  All
                </FilterPill>
                {SHOT_LIES.filter((l) => usedLies.includes(l.value)).map(
                  (l) => (
                    <FilterPill
                      key={l.value}
                      active={lieFilter === l.value}
                      onClick={() => setLieFilter(l.value)}
                    >
                      {l.label}
                    </FilterPill>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Scatter Plot */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Dispersion Pattern
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({shots.length} shot{shots.length !== 1 ? "s" : ""})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No shots match the current filters
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Left/Right"
                      unit="ft"
                      domain={["auto", "auto"]}
                      label={{ value: "← Left | Right →", position: "bottom", offset: 0, style: { fontSize: 11 } }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Short/Long"
                      unit="ft"
                      domain={["auto", "auto"]}
                      label={{ value: "← Short | Long →", angle: -90, position: "left", offset: -5, style: { fontSize: 11 } }}
                    />
                    <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.4} />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.4} />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload?.[0]) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-popover border rounded-md p-2 text-xs shadow-md">
                            <p className="font-medium">{d.club}</p>
                            <p>
                              {d.x > 0 ? `${d.x}ft right` : d.x < 0 ? `${Math.abs(d.x)}ft left` : "On line"}
                              {", "}
                              {d.y > 0 ? `${d.y}ft long` : d.y < 0 ? `${Math.abs(d.y)}ft short` : "Pin high"}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Scatter
                      data={scatterData}
                      fill="hsl(var(--primary))"
                      fillOpacity={0.7}
                      r={5}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard
                label="Avg Miss"
                value={`${stats.avgMissDistance.toFixed(1)}ft`}
              />
              <StatCard
                label="80% Radius"
                value={`${stats.dispersionRadius80.toFixed(1)}ft`}
              />
              <StatCard
                label="Tendency"
                value={`${Math.abs(stats.avgMissX).toFixed(1)}ft ${stats.avgMissX >= 0 ? "R" : "L"}, ${Math.abs(stats.avgMissY).toFixed(1)}ft ${stats.avgMissY >= 0 ? "long" : "short"}`}
              />
              <StatCard
                label="Miss Left"
                value={`${stats.pctLeft.toFixed(0)}%`}
              />
              <StatCard
                label="Miss Right"
                value={`${stats.pctRight.toFixed(0)}%`}
              />
              <StatCard
                label="Avg Target"
                value={`${stats.avgTargetDistance.toFixed(0)} yds`}
              />
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card/60 text-white/70 border-white/20 hover:bg-card/80"
      )}
    >
      {children}
    </button>
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
