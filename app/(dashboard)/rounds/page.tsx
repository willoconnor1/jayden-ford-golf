"use client";

import Link from "next/link";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageBackground } from "@/components/layout/page-background";
import { useRoundStore } from "@/stores/round-store";
import { useHydration } from "@/hooks/use-hydration";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import { format } from "date-fns";
import { cn, roundBadgeColor } from "@/lib/utils";
import { toast } from "sonner";

export default function RoundsPage() {
  const hydrated = useHydration();
  const rounds = useRoundStore((s) => s.rounds);
  const deleteRound = useRoundStore((s) => s.deleteRound);

  const sorted = [...rounds].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (!hydrated) {
    return (
      <>
        <PageBackground image="/kauri-cliffs.jpg" />
        <div className="relative z-10 animate-pulse space-y-3">
          <div className="h-8 bg-muted/60 rounded w-48" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted/60 rounded-lg" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageBackground image="/kauri-cliffs.jpg" />
      <div className="relative z-10">
      <PageHeader title="Round History" description={`${rounds.length} round${rounds.length === 1 ? "" : "s"}`}>
        <Link href="/rounds/new" className={buttonVariants()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Round
        </Link>
      </PageHeader>

      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/70">No rounds yet. Log your first round to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((round) => {
            const stats = calculateRoundStats(round);
            const scoreToPar = stats.scoreToPar;
            return (
              <Card key={round.id}>
                <CardContent className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/rounds/${round.id}`}
                      className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">
                            {round.course.name}
                          </p>
                          <p className="text-xs sm:text-sm text-white/60">
                            {format(new Date(round.date), "MMM d, yyyy")}{" "}
                            {round.course.tees && `| ${round.course.tees}`}
                          </p>
                          <div className="flex gap-2 sm:gap-3 mt-0.5 text-xs text-white/60">
                            <span>FW {stats.fairwayPercentage.toFixed(0)}%</span>
                            <span>GIR {stats.girPercentage.toFixed(0)}%</span>
                            <span>{stats.totalPutts} putts</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xl sm:text-2xl font-bold tabular-nums">
                            {stats.totalScore}
                          </span>
                          <Badge
                            className={cn(
                              "tabular-nums text-xs",
                              roundBadgeColor(scoreToPar)
                            )}
                          >
                            {scoreToPar === 0 ? "E" : scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-9 w-9 text-white/60 hover:text-destructive"
                      onClick={() => {
                        deleteRound(round.id);
                        toast.success("Round deleted");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
