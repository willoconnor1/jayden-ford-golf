"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  calculateLeaderboard,
  formatScoreToPar,
  formatThru,
  formatRank,
} from "@/lib/live/leaderboard";
import type { LiveEventData } from "@/lib/types";

interface LeaderboardTableProps {
  data: LiveEventData;
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  const { event, players, scores } = data;
  const entries = calculateLeaderboard(players, scores, event.holePars);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No players yet
      </p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full text-sm" style={{ minWidth: "320px" }}>
        <thead>
          <tr className="border-b text-muted-foreground text-xs">
            <th className="py-2 px-2 text-left w-10">Pos</th>
            <th className="py-2 px-2 text-left">Player</th>
            <th className="py-2 px-2 text-center w-16">Score</th>
            <th className="py-2 px-2 text-center w-12">Thru</th>
            <th className="py-2 px-2 text-center w-12">Tot</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const scoreStr = formatScoreToPar(entry.scoreToPar, entry.thru);
            return (
              <tr key={entry.playerId} className="border-b last:border-0">
                <td className="py-3 px-2 text-muted-foreground text-xs">
                  {formatRank(entry.rank, entries)}
                </td>
                <td className="py-3 px-2">
                  <Link
                    href={`/live/${event.id}/scorecard/${entry.playerId}`}
                    className="font-medium hover:underline"
                  >
                    {entry.playerName}
                  </Link>
                </td>
                <td className="py-3 px-2 text-center">
                  {entry.thru > 0 ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "tabular-nums font-bold text-xs px-2",
                        entry.scoreToPar < 0 && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                        entry.scoreToPar > 0 && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                        entry.scoreToPar === 0 && "bg-muted text-muted-foreground"
                      )}
                    >
                      {scoreStr}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 px-2 text-center text-muted-foreground tabular-nums text-xs">
                  {formatThru(entry.thru)}
                </td>
                <td className="py-3 px-2 text-center tabular-nums text-xs">
                  {entry.thru > 0 ? entry.totalStrokes : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
