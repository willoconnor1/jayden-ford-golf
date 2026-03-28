"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { PageBackground } from "@/components/layout/page-background";
import { useGoalStore } from "@/stores/goal-store";
import { useHydration } from "@/hooks/use-hydration";
import { useGoalProgress } from "@/hooks/use-goal-progress";
import { useStats } from "@/hooks/use-stats";
import { useStrokesGained } from "@/hooks/use-strokes-gained";
import { Goal, StatCategory } from "@/lib/types";
import { STAT_LABELS, STAT_DIRECTION, formatStat } from "@/lib/constants";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

function GoalCard({ goal }: { goal: Goal }) {
  const { currentValue, progress, isAchieved } = useGoalProgress(goal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const completeGoal = useGoalStore((s) => s.completeGoal);
  const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());

  useEffect(() => {
    if (isAchieved && !goal.isCompleted) {
      completeGoal(goal.id);
      toast.success(`Goal achieved: ${STAT_LABELS[goal.statCategory]}!`);
    }
  }, [isAchieved, goal.isCompleted, goal.id, goal.statCategory, completeGoal]);

  return (
    <Card className={cn(goal.isCompleted && "border-primary/50 bg-primary/5")}>
      <CardContent className="pt-3 pb-3 px-3 sm:px-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm">
              {STAT_LABELS[goal.statCategory]}
            </p>
            <p className="text-xs text-white/60">
              Target: {formatStat(goal.targetValue, goal.statCategory)} by{" "}
              {format(new Date(goal.targetDate), "MMM d")}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {goal.isCompleted ? (
              <Badge className="bg-primary text-xs">Done</Badge>
            ) : daysLeft < 0 ? (
              <Badge variant="secondary" className="bg-red-500/20 text-red-400 text-xs">
                Overdue
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">{daysLeft}d</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/50 hover:text-destructive"
              onClick={() => {
                deleteGoal(goal.id);
                toast.success("Goal removed");
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/70">
            <span>
              Current: {formatStat(currentValue, goal.statCategory)}
            </span>
            <span>
              Target: {formatStat(goal.targetValue, goal.statCategory)}
            </span>
          </div>
          <Progress
            value={Math.max(0, Math.min(100, progress))}
            className="h-2"
          />
          <p className="text-xs text-white/60 text-right">
            {progress.toFixed(0)}% complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GoalsPage() {
  const hydrated = useHydration();
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const { aggregateStats } = useStats();
  const { sgAverages } = useStrokesGained();
  const [open, setOpen] = useState(false);
  const [statCategory, setStatCategory] = useState<StatCategory>("fairwayPercentage");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");

  if (!hydrated) {
    return <><PageBackground image="/kinloch-2.webp" /><div className="relative z-10 animate-pulse h-64 bg-muted/60 rounded-lg" /></>;
  }

  const getCurrentValue = (cat: StatCategory): number => {
    if (cat.startsWith("sg") && sgAverages) {
      return sgAverages[cat as keyof typeof sgAverages] ?? 0;
    }
    return (aggregateStats as unknown as Record<string, number>)[cat] ?? 0;
  };

  const handleAddGoal = () => {
    if (!targetValue || !targetDate) {
      toast.error("Please fill in all fields");
      return;
    }

    const goal: Goal = {
      id: crypto.randomUUID(),
      statCategory,
      targetValue: parseFloat(targetValue),
      startValue: getCurrentValue(statCategory),
      targetDate,
      direction: STAT_DIRECTION[statCategory],
      createdAt: new Date().toISOString(),
      isCompleted: false,
      completedAt: null,
    };

    addGoal(goal);
    toast.success("Goal created!");
    setOpen(false);
    setTargetValue("");
    setTargetDate("");
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <>
      <PageBackground image="/kinloch-2.webp" />
      <div className="relative z-10">
      <PageHeader title="Goals" description="Set targets and track your progress">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Stat to improve</Label>
                <Select
                  value={statCategory}
                  onValueChange={(v) => setStatCategory(v as StatCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STAT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/60">
                  Current: {formatStat(getCurrentValue(statCategory), statCategory)}
                  {" | "}
                  {STAT_DIRECTION[statCategory] === "increase"
                    ? "Higher is better"
                    : "Lower is better"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Target value</Label>
                <Input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={`e.g., ${STAT_DIRECTION[statCategory] === "increase" ? "65" : "30"}`}
                  step={statCategory.startsWith("sg") ? "0.1" : "1"}
                />
              </div>

              <div className="space-y-2">
                <Label>Target date</Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <Button onClick={handleAddGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="space-y-6">
        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <div className="text-center py-12 text-white/70">
            <p>No goals yet. Set your first goal to start tracking progress.</p>
          </div>
        )}

        {activeGoals.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-white drop-shadow-sm">Active Goals</h2>
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}

        {completedGoals.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-primary text-white drop-shadow-sm">Completed</h2>
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
