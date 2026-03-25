"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import { cn, roundBadgeColor } from "@/lib/utils";
import { formatScoreToPar } from "@/lib/live/leaderboard";
import type { LiveEventData } from "@/lib/types";

interface PlayerScorecardProps {
  data: LiveEventData;
  playerId: string;
}

export function PlayerScorecard({ data, playerId }: PlayerScorecardProps) {
  const { event, players, scores } = data;
  const player = players.find((p) => p.id === playerId);
  const playerScores = scores.filter((s) => s.playerId === playerId);

  if (!player) {
    return <p className="text-sm text-muted-foreground">Player not found</p>;
  }

  // Build hole-by-hole data
  const scoreMap = new Map(playerScores.map((s) => [s.holeNumber, s.strokes]));
  const thru = playerScores.length;
  const totalStrokes = playerScores.reduce((sum, s) => sum + s.strokes, 0);
  const totalPar = playerScores.reduce(
    (sum, s) => sum + (event.holePars[s.holeNumber - 1] ?? 0),
    0
  );
  const scoreToPar = thru > 0 ? totalStrokes - totalPar : 0;

  // Front/back 9 calculations
  const front9Strokes = Array.from({ length: 9 }, (_, i) => scoreMap.get(i + 1) ?? 0).reduce((a, b) => a + b, 0);
  const back9Strokes = Array.from({ length: 9 }, (_, i) => scoreMap.get(i + 10) ?? 0).reduce((a, b) => a + b, 0);
  const front9Par = event.holePars.slice(0, 9).reduce((a, b) => a + b, 0);
  const back9Par = event.holePars.slice(9, 18).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Score Summary */}
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-4xl font-bold">{thru > 0 ? totalStrokes : "-"}</p>
          {thru > 0 && (
            <Badge className={cn("mt-2 text-sm", roundBadgeColor(scoreToPar))}>
              {formatScoreToPar(scoreToPar, thru)}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Thru {thru} {thru === 1 ? "hole" : "holes"}
          </p>
        </CardContent>
      </Card>

      {/* Scorecard */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Scorecard</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-6">
          {/* Front 9 */}
          <table className="w-full text-xs text-center tabular-nums" style={{ minWidth: "340px" }}>
            <thead>
              <tr className="border-b">
                <th className="py-1.5 px-1 text-left text-muted-foreground">Hole</th>
                {Array.from({ length: 9 }, (_, i) => (
                  <th key={i} className="py-1.5 px-0.5 w-7">{i + 1}</th>
                ))}
                <th className="py-1.5 px-1 font-bold">Out</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b text-muted-foreground">
                <td className="py-1.5 px-1 text-left">Par</td>
                {event.holePars.slice(0, 9).map((par, i) => (
                  <td key={i} className="py-1.5 px-0.5">{par}</td>
                ))}
                <td className="py-1.5 px-1 font-medium">{front9Par}</td>
              </tr>
              <tr className="border-b font-medium">
                <td className="py-1.5 px-1 text-left">Score</td>
                {Array.from({ length: 9 }, (_, i) => {
                  const strokes = scoreMap.get(i + 1);
                  const par = event.holePars[i];
                  return (
                    <td key={i} className="py-1.5 px-0.5">
                      {strokes != null ? (
                        <ScoreIndicator score={strokes} par={par} />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-1.5 px-1 font-bold">
                  {front9Strokes > 0 ? front9Strokes : "-"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Back 9 */}
          <table className="w-full text-xs text-center tabular-nums mt-3" style={{ minWidth: "380px" }}>
            <thead>
              <tr className="border-b">
                <th className="py-1.5 px-1 text-left text-muted-foreground">Hole</th>
                {Array.from({ length: 9 }, (_, i) => (
                  <th key={i} className="py-1.5 px-0.5 w-7">{i + 10}</th>
                ))}
                <th className="py-1.5 px-1 font-bold">In</th>
                <th className="py-1.5 px-1 font-bold">Tot</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b text-muted-foreground">
                <td className="py-1.5 px-1 text-left">Par</td>
                {event.holePars.slice(9, 18).map((par, i) => (
                  <td key={i} className="py-1.5 px-0.5">{par}</td>
                ))}
                <td className="py-1.5 px-1 font-medium">{back9Par}</td>
                <td className="py-1.5 px-1 font-medium">
                  {event.holePars.reduce((a, b) => a + b, 0)}
                </td>
              </tr>
              <tr className="border-b font-medium">
                <td className="py-1.5 px-1 text-left">Score</td>
                {Array.from({ length: 9 }, (_, i) => {
                  const strokes = scoreMap.get(i + 10);
                  const par = event.holePars[i + 9];
                  return (
                    <td key={i} className="py-1.5 px-0.5">
                      {strokes != null ? (
                        <ScoreIndicator score={strokes} par={par} />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-1.5 px-1 font-bold">
                  {back9Strokes > 0 ? back9Strokes : "-"}
                </td>
                <td className="py-1.5 px-1 font-bold">
                  {totalStrokes > 0 ? totalStrokes : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
