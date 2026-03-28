"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import { calculateRoundStrokesGained } from "@/lib/stats/strokes-gained";
import { format } from "date-fns";
import { cn, holeScoreColor, roundBadgeColor } from "@/lib/utils";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import type { Round } from "@/lib/types";

interface AdminRound extends Round {
  userId: string;
  userName: string;
  userEmail: string;
}

export default function AdminRoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [round, setRound] = useState<AdminRound | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/rounds/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load round");
        return res.json();
      })
      .then((data) => setRound(data.round))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  if (error || !round) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg font-medium">
          {error ?? "Round not found"}
        </p>
        <Link
          href="/admin"
          className={buttonVariants({ variant: "outline" }) + " mt-4"}
        >
          Back to Admin
        </Link>
      </div>
    );
  }

  const stats = calculateRoundStats(round);
  const sg = calculateRoundStrokesGained(round);

  return (
    <>
      <Link
        href="/admin"
        className={buttonVariants({ variant: "ghost" }) + " mb-3"}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin
      </Link>

      <PageHeader
        title={round.course.name}
        description={`${round.userName} | ${format(new Date(round.date), "MMM d, yyyy")} ${round.course.tees ? `| ${round.course.tees} tees` : ""}`}
      />

      <div className="space-y-4">
        {/* Score header */}
        <Card>
          <CardContent className="py-4 sm:py-6 text-center">
            <p className="text-4xl sm:text-5xl font-bold">{stats.totalScore}</p>
            <Badge
              className={cn(
                "mt-2 text-sm",
                roundBadgeColor(stats.scoreToPar)
              )}
            >
              {stats.scoreToPar === 0
                ? "Even Par"
                : stats.scoreToPar > 0
                  ? `+${stats.scoreToPar}`
                  : stats.scoreToPar}
            </Badge>
          </CardContent>
        </Card>

        {/* Scorecard */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Scorecard</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-6">
            <table
              className="w-full text-xs text-center tabular-nums"
              style={{ minWidth: "340px" }}
            >
              <thead>
                <tr className="border-b">
                  <th className="py-1.5 px-1 text-left text-white/60">
                    Hole
                  </th>
                  {round.holes.slice(0, 9).map((_, i) => (
                    <th key={i} className="py-1.5 px-0.5 w-7">
                      {i + 1}
                    </th>
                  ))}
                  <th className="py-1.5 px-1 font-bold">Out</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b text-white/60">
                  <td className="py-1.5 px-1 text-left">Par</td>
                  {round.holes.slice(0, 9).map((h, i) => (
                    <td key={i} className="py-1.5 px-0.5">
                      {h.par}
                    </td>
                  ))}
                  <td className="py-1.5 px-1 font-medium">
                    {round.holes.slice(0, 9).reduce((s, h) => s + h.par, 0)}
                  </td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-1.5 px-1 text-left">Score</td>
                  {round.holes.slice(0, 9).map((h, i) => (
                    <td key={i} className="py-1.5 px-0.5">
                      <ScoreIndicator score={h.score} par={h.par} />
                    </td>
                  ))}
                  <td className="py-1.5 px-1 font-bold">
                    {round.holes.slice(0, 9).reduce((s, h) => s + h.score, 0)}
                  </td>
                </tr>
                <tr className="border-b text-white/60">
                  <td className="py-1.5 px-1 text-left">Putts</td>
                  {round.holes.slice(0, 9).map((h, i) => (
                    <td key={i} className="py-1.5 px-0.5">
                      {h.putts}
                    </td>
                  ))}
                  <td className="py-1.5 px-1 font-medium">
                    {round.holes.slice(0, 9).reduce((s, h) => s + h.putts, 0)}
                  </td>
                </tr>
              </tbody>
            </table>

            <table
              className="w-full text-xs text-center tabular-nums mt-3"
              style={{ minWidth: "380px" }}
            >
              <thead>
                <tr className="border-b">
                  <th className="py-1.5 px-1 text-left text-white/60">
                    Hole
                  </th>
                  {round.holes.slice(9, 18).map((_, i) => (
                    <th key={i} className="py-1.5 px-0.5 w-7">
                      {i + 10}
                    </th>
                  ))}
                  <th className="py-1.5 px-1 font-bold">In</th>
                  <th className="py-1.5 px-1 font-bold">Tot</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b text-white/60">
                  <td className="py-1.5 px-1 text-left">Par</td>
                  {round.holes.slice(9, 18).map((h, i) => (
                    <td key={i} className="py-1.5 px-0.5">
                      {h.par}
                    </td>
                  ))}
                  <td className="py-1.5 px-1 font-medium">
                    {round.holes.slice(9, 18).reduce((s, h) => s + h.par, 0)}
                  </td>
                  <td className="py-1.5 px-1 font-medium">
                    {round.holes.reduce((s, h) => s + h.par, 0)}
                  </td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-1.5 px-1 text-left">Score</td>
                  {round.holes.slice(9, 18).map((h, i) => (
                    <td key={i} className="py-1.5 px-0.5">
                      <ScoreIndicator score={h.score} par={h.par} />
                    </td>
                  ))}
                  <td className="py-1.5 px-1 font-bold">
                    {round.holes.slice(9, 18).reduce((s, h) => s + h.score, 0)}
                  </td>
                  <td className="py-1.5 px-1 font-bold">{stats.totalScore}</td>
                </tr>
                <tr className="border-b text-white/60">
                  <td className="py-1.5 px-1 text-left">Putts</td>
                  {round.holes.slice(9, 18).map((h, i) => (
                    <td key={i} className="py-1.5 px-0.5">
                      {h.putts}
                    </td>
                  ))}
                  <td className="py-1.5 px-1 font-medium">
                    {round.holes.slice(9, 18).reduce((s, h) => s + h.putts, 0)}
                  </td>
                  <td className="py-1.5 px-1 font-medium">
                    {stats.totalPutts}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm text-white/60">
                Fairways
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold">
                {stats.fairwaysHit}/{stats.fairwaysAttempted}
              </p>
              <p className="text-xs sm:text-sm text-white/60">
                {stats.fairwayPercentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm text-white/60">
                Greens in Reg
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold">
                {stats.greensInRegulation}/18
              </p>
              <p className="text-xs sm:text-sm text-white/60">
                {stats.girPercentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm text-white/60">
                Total Putts
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold">{stats.totalPutts}</p>
              <p className="text-xs sm:text-sm text-white/60">
                {stats.puttsPerGir.toFixed(2)} per GIR
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm text-white/60">
                Scrambling
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold">
                {stats.scramblingPercentage.toFixed(0)}%
              </p>
              <p className="text-xs sm:text-sm text-white/60">
                {stats.upAndDownConversions}/{stats.upAndDownAttempts} up & down
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Strokes Gained */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Strokes Gained vs PGA Tour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "Off the Tee", value: sg.sgOffTheTee },
              { label: "Approach", value: sg.sgApproach },
              { label: "Around the Green", value: sg.sgAroundTheGreen },
              { label: "Putting", value: sg.sgPutting },
              { label: "Total", value: sg.sgTotal },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-0.5"
              >
                <span className="text-sm">{item.label}</span>
                <span
                  className={cn(
                    "font-bold tabular-nums",
                    item.value >= 0 ? "text-primary" : "text-red-500"
                  )}
                >
                  {item.value > 0 ? "+" : ""}
                  {item.value.toFixed(2)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {round.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/60 whitespace-pre-wrap">
                {round.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
