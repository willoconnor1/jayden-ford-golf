"use client";

import Link from "next/link";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { useRoundStore } from "@/stores/round-store";
import { useHydration } from "@/hooks/use-hydration";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-muted rounded w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Round History" description={`${rounds.length} round${rounds.length === 1 ? "" : "s"}`}>
        <Link href="/rounds/new" className={buttonVariants()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Round
        </Link>
      </PageHeader>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No rounds yet. Log your first round to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((round) => {
            const stats = calculateRoundStats(round);
            const scoreToPar = stats.scoreToPar;
            return (
              <Card key={round.id}>
                <CardContent className="py-4 px-4">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/rounds/${round.id}`}
                      className="flex-1 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {round.course.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(round.date), "MMMM d, yyyy")}{" "}
                            {round.course.tees && `| ${round.course.tees} tees`}
                          </p>
                          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                            <span>FW {stats.fairwayPercentage.toFixed(0)}%</span>
                            <span>GIR {stats.girPercentage.toFixed(0)}%</span>
                            <span>{stats.totalPutts} putts</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold tabular-nums">
                            {stats.totalScore}
                          </span>
                          <Badge
                            variant={scoreToPar <= 0 ? "default" : "secondary"}
                            className={cn(
                              "tabular-nums",
                              scoreToPar < 0 && "bg-green-600",
                              scoreToPar === 0 && "bg-blue-600",
                              scoreToPar > 0 && "bg-muted text-muted-foreground"
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
                      className="ml-2 text-muted-foreground hover:text-destructive"
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
    </>
  );
}
