"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { useHydration } from "@/hooks/use-hydration";
import { useStrokesGained } from "@/hooks/use-strokes-gained";
import { useRoundStore } from "@/stores/round-store";
import { analyzePracticeNeeds } from "@/lib/stats/practice-analyzer";
import { DRILL_DATABASE } from "@/lib/drills/drill-database";
import { PracticeFocus, Drill } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  driving: "Driving",
  approach: "Approach",
  shortGame: "Short Game",
  putting: "Putting",
};

const CATEGORY_COLORS: Record<string, string> = {
  driving: "bg-blue-100 text-blue-800",
  approach: "bg-orange-100 text-orange-800",
  shortGame: "bg-emerald-100 text-emerald-800",
  putting: "bg-purple-100 text-purple-800",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
};

function DrillCard({ drill }: { drill: Drill }) {
  return (
    <Card>
      <CardContent className="pt-3 pb-3 px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 mb-2">
          <h3 className="font-medium text-sm">{drill.name}</h3>
          <div className="flex gap-1 shrink-0">
            <Badge variant="secondary" className={cn("text-[10px] sm:text-xs", CATEGORY_COLORS[drill.category])}>
              {CATEGORY_LABELS[drill.category]}
            </Badge>
            <Badge variant="secondary" className={cn("text-[10px] sm:text-xs", DIFFICULTY_COLORS[drill.difficulty])}>
              {drill.difficulty}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {drill.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{drill.duration}</span>
          <span>Target: {drill.targetStat}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function WeaknessSummary({ focuses }: { focuses: PracticeFocus[] }) {
  return (
    <div className="space-y-4">
      {focuses.map((focus) => (
        <Card
          key={focus.category}
          className={cn(
            focus.severity === "critical" && "border-red-300",
            focus.severity === "moderate" && "border-yellow-300"
          )}
        >
          <CardContent className="pt-3 pb-3 px-3 sm:px-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", CATEGORY_COLORS[focus.category])}
                >
                  {CATEGORY_LABELS[focus.category]}
                </Badge>
                {focus.severity === "critical" && (
                  <Badge className="bg-red-600 text-xs">Priority</Badge>
                )}
              </div>
              <span
                className={cn(
                  "font-bold tabular-nums text-sm shrink-0",
                  focus.sgValue >= 0 ? "text-green-600" : "text-red-500"
                )}
              >
                {focus.sgValue >= 0 ? "+" : ""}
                {focus.sgValue.toFixed(2)} SG
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              {focus.description}
            </p>

            <p className="text-sm font-medium">{focus.recommendation}</p>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Practice time allocation</span>
                <span>{focus.practiceTimeAllocation}%</span>
              </div>
              <Progress value={focus.practiceTimeAllocation} className="h-2" />
            </div>

            {focus.suggestedDrills.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium">Recommended Drills:</p>
                {focus.suggestedDrills.map((drill) => (
                  <div
                    key={drill.id}
                    className="text-xs text-muted-foreground flex justify-between items-center"
                  >
                    <span>{drill.name}</span>
                    <span>{drill.duration}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PracticePage() {
  const hydrated = useHydration();
  const rounds = useRoundStore((s) => s.rounds);
  const { sgAverages } = useStrokesGained();

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  if (rounds.length === 0 || !sgAverages) {
    return (
      <>
        <PageHeader title="Practice Plan" />
        <div className="text-center py-12">
          <div className="text-4xl mb-4 text-muted-foreground">—</div>
          <h2 className="text-xl font-bold mb-2">Need Round Data First</h2>
          <p className="text-muted-foreground mb-4">
            Log a few rounds so we can analyze your game and create a
            personalized practice plan.
          </p>
          <Link href="/rounds/new" className={buttonVariants()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Log a Round
          </Link>
        </div>
      </>
    );
  }

  const focuses = analyzePracticeNeeds(sgAverages);

  return (
    <>
      <PageHeader
        title="Practice Plan"
        description="Personalized recommendations based on your strokes gained data"
      />

      <Tabs defaultValue="plan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plan">Your Plan</TabsTrigger>
          <TabsTrigger value="drills">All Drills</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          <WeaknessSummary focuses={focuses} />
        </TabsContent>

        <TabsContent value="drills" className="space-y-6">
          {(["driving", "approach", "shortGame", "putting"] as const).map(
            (cat) => {
              const drills = DRILL_DATABASE.filter((d) => d.category === cat);
              return (
                <div key={cat} className="space-y-3">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(CATEGORY_COLORS[cat])}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {drills.length} drills
                    </span>
                  </h2>
                  {drills.map((drill) => (
                    <DrillCard key={drill.id} drill={drill} />
                  ))}
                </div>
              );
            }
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
