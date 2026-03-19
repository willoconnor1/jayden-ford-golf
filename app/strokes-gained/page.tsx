"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
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
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  if (rounds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">&#9971;</div>
        <h2 className="text-xl font-bold mb-2">No Rounds Yet</h2>
        <p className="text-muted-foreground mb-4">
          Log at least one round to see your strokes gained analysis.
        </p>
        <Link href="/rounds/new" className={buttonVariants()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Log a Round
        </Link>
      </div>
    );
  }

  const barData = sgAverages
    ? [
        { category: "Off the Tee", value: sgAverages.sgOffTheTee, fill: sgAverages.sgOffTheTee >= 0 ? "#22c55e" : "#ef4444" },
        { category: "Approach", value: sgAverages.sgApproach, fill: sgAverages.sgApproach >= 0 ? "#22c55e" : "#ef4444" },
        { category: "Around Green", value: sgAverages.sgAroundTheGreen, fill: sgAverages.sgAroundTheGreen >= 0 ? "#22c55e" : "#ef4444" },
        { category: "Putting", value: sgAverages.sgPutting, fill: sgAverages.sgPutting >= 0 ? "#22c55e" : "#ef4444" },
      ]
    : [];

  const trendData = [...sgByRound].reverse().map((r) => ({
    date: format(new Date(r.date), "MM/dd"),
    "Off the Tee": Number(r.sg.sgOffTheTee.toFixed(2)),
    Approach: Number(r.sg.sgApproach.toFixed(2)),
    "Around Green": Number(r.sg.sgAroundTheGreen.toFixed(2)),
    Putting: Number(r.sg.sgPutting.toFixed(2)),
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
      <PageHeader
        title="Strokes Gained"
        description="Your performance vs PGA Tour average"
      />

      <div className="space-y-6">
        {/* Summary cards */}
        {sgAverages && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Off the Tee", value: sgAverages.sgOffTheTee },
              { label: "Approach", value: sgAverages.sgApproach },
              { label: "Around Green", value: sgAverages.sgAroundTheGreen },
              { label: "Putting", value: sgAverages.sgPutting },
              { label: "Total", value: sgAverages.sgTotal },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums",
                      item.value >= 0 ? "text-green-600" : "text-red-500"
                    )}
                  >
                    {item.value >= 0 ? "+" : ""}
                    {item.value.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Strokes Gained Breakdown (Average)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={["auto", "auto"]} />
                  <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value >= 0 ? "+" : ""}${value.toFixed(2)}`,
                      "Strokes Gained",
                    ]}
                  />
                  <ReferenceLine x={0} stroke="#666" />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Green = gaining strokes vs PGA Tour average, Red = losing strokes
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trend chart */}
          {trendData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="Off the Tee" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Approach" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Around Green" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Putting" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Radar chart */}
          {radarData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis tick={{ fontSize: 10 }} />
                      <Radar
                        dataKey="value"
                        stroke="#16a34a"
                        fill="#16a34a"
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
          <CardHeader>
            <CardTitle className="text-lg">Understanding Strokes Gained</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Strokes Gained</strong> measures how many strokes you gain
              (or lose) compared to a PGA Tour player from the same position.
              A positive value means you outperformed the tour average; negative
              means you underperformed.
            </p>
            <p>
              <strong>Off the Tee:</strong> Driving performance on par 4s and 5s (distance and accuracy).
            </p>
            <p>
              <strong>Approach:</strong> All approach shots to the green, including par 3 tee shots.
            </p>
            <p>
              <strong>Around the Green:</strong> Short game shots within ~30 yards of the green.
            </p>
            <p>
              <strong>Putting:</strong> All putts on the green, measured from your first putt distance.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
