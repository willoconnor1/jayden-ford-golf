"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Round } from "@/lib/types";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RecentRoundsProps {
  rounds: Round[];
}

export function RecentRounds({ rounds }: RecentRoundsProps) {
  const recent = rounds.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Rounds</CardTitle>
          <Link
            href="/rounds"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {recent.map((round) => {
          const stats = calculateRoundStats(round);
          const scoreToPar = stats.scoreToPar;
          return (
            <Link
              key={round.id}
              href={`/rounds/${round.id}`}
              className="flex items-center justify-between gap-2 py-2 px-2 sm:px-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{round.course.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(round.date), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-base sm:text-lg font-bold tabular-nums">
                  {stats.totalScore}
                </span>
                <Badge
                  variant={scoreToPar <= 0 ? "default" : "secondary"}
                  className={cn(
                    "text-xs tabular-nums",
                    scoreToPar < 0 && "bg-green-600 hover:bg-green-700",
                    scoreToPar === 0 && "bg-blue-600 hover:bg-blue-700",
                    scoreToPar > 0 && "bg-muted text-muted-foreground"
                  )}
                >
                  {scoreToPar === 0 ? "E" : scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
                </Badge>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
