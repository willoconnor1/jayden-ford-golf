"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PageBackground } from "@/components/layout/page-background";
import { useHydration } from "@/hooks/use-hydration";
import { useStrokesGained } from "@/hooks/use-strokes-gained";
import { useRoundStore } from "@/stores/round-store";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { format } from "date-fns";

export default function StrokesGainedPage() {
  const hydrated = useHydration();
  const rounds = useRoundStore((s) => s.rounds);
  const { sgByRound, sgAverages } = useStrokesGained();

  if (!hydrated) {
    return <><PageBackground image="/cap-kidnappers.jpg" /><div className="relative z-10 animate-pulse h-96 bg-muted/60 rounded-lg" /></>;
  }

  if (rounds.length === 0) {
    return (
      <>
        <PageBackground image="/cap-kidnappers.jpg" />
        <div className="relative z-10 text-center py-12">
          <h2 className="text-xl font-bold mb-2 text-white drop-shadow-md">No Rounds Yet</h2>
          <p className="text-white/70 mb-4">
            Log at least one round to see your strokes gained analysis.
          </p>
          <Link href="/rounds/new" className={buttonVariants()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Log a Round
          </Link>
        </div>
      </>
    );
  }

  // Shorter labels for mobile bar chart
  const barData = sgAverages
    ? [
        { category: "Tee", value: sgAverages.sgOffTheTee, fill: sgAverages.sgOffTheTee >= 0 ? "#6BA3D6" : "#ef4444" },
        { category: "Approach", value: sgAverages.sgApproach, fill: sgAverages.sgApproach >= 0 ? "#6BA3D6" : "#ef4444" },
        { category: "Short Game", value: sgAverages.sgAroundTheGreen, fill: sgAverages.sgAroundTheGreen >= 0 ? "#6BA3D6" : "#ef4444" },
        { category: "Putting", value: sgAverages.sgPutting, fill: sgAverages.sgPutting >= 0 ? "#6BA3D6" : "#ef4444" },
      ]
    : [];

  const trendData = [...sgByRound].reverse().map((r) => ({
    date: format(new Date(r.date), "MM/dd"),
    Tee: Number(r.sg.sgOffTheTee.toFixed(2)),
    App: Number(r.sg.sgApproach.toFixed(2)),
    Short: Number(r.sg.sgAroundTheGreen.toFixed(2)),
    Putt: Number(r.sg.sgPutting.toFixed(2)),
  }));

  const radarData = sgAverages
    ? [
        { stat: "Tee", value: sgAverages.sgOffTheTee },
        { stat: "Approach", value: sgAverages.sgApproach },
        { stat: "Short Game", value: sgAverages.sgAroundTheGreen },
        { stat: "Putting", value: sgAverages.sgPutting },
      ]
    : [];

  return (
    <>
      <PageBackground image="/cap-kidnappers.jpg" />
      <div className="relative z-10">
      <PageHeader
        title="Strokes Gained"
        description="Your performance vs PGA Tour average"
      />

      <div className="space-y-4 sm:space-y-6">
        {/* Summary cards */}
        {sgAverages && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {[
              { label: "Off the Tee", value: sgAverages.sgOffTheTee },
              { label: "Approach", value: sgAverages.sgApproach },
              { label: "Short Game", value: sgAverages.sgAroundTheGreen },
              { label: "Putting", value: sgAverages.sgPutting },
              { label: "Total", value: sgAverages.sgTotal },
            ].map((item) => (
              <Card key={item.label} className={cn(item.label === "Total" && "col-span-2 sm:col-span-1")}>
                <CardContent className="pt-3 pb-2 px-3 sm:pt-4 sm:pb-3 sm:px-4">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
                  <p
                    className={cn(
                      "text-xl sm:text-2xl font-bold tabular-nums",
                      item.value >= 0 ? "text-primary" : "text-red-500"
                    )}
                  >
                    {item.value > 0 ? "+" : ""}
                    {item.value.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              SG Breakdown (Average)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="category" width={75} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value > 0 ? "+" : ""}${value.toFixed(2)}`,
                      "Strokes Gained",
                    ]}
                  />
                  <ReferenceLine x={0} stroke="#666" />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 text-center">
              Blue = gaining vs PGA Tour, Red = losing
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Trend chart */}
          {trendData.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ left: -10, right: 5, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} width={35} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="Tee" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="App" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Short" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Putt" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Radar chart */}
          {radarData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Game Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid />
                      <PolarAngleAxis dataKey="stat" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis tick={{ fontSize: 9 }} />
                      <Radar
                        dataKey="value"
                        stroke="#6BA3D6"
                        fill="#6BA3D6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* What is Strokes Gained */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Understanding Strokes Gained</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Strokes Gained</strong> measures how many strokes you gain
              (or lose) compared to a PGA Tour player from the same position.
              A positive value means you outperformed the tour average; negative
              means you underperformed.
            </p>
            <p>
              <strong>Off the Tee:</strong> Driving performance on par 4s and 5s.
            </p>
            <p>
              <strong>Approach:</strong> All approach shots to the green, including par 3 tee shots.
            </p>
            <p>
              <strong>Around the Green:</strong> Short game shots within ~30 yards.
            </p>
            <p>
              <strong>Putting:</strong> All putts, measured from your first putt distance.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}
