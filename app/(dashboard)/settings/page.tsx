"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRoundStore } from "@/stores/round-store";
import { useGoalStore } from "@/stores/goal-store";
import { useAuth } from "@/components/auth-provider";
import { Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Round, Goal, BENCHMARK_LEVELS, BENCHMARK_LABELS, BenchmarkLevel } from "@/lib/types";

interface ExportData {
  version: number;
  exportedAt: string;
  rounds: Round[];
  goals: Goal[];
}

export default function SettingsPage() {
  const rounds = useRoundStore((s) => s.rounds);
  const addRound = useRoundStore((s) => s.addRound);
  const clearSeedData = useRoundStore((s) => s.clearSeedData);
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const { user, refreshUser } = useAuth();
  const [importing, setImporting] = useState(false);
  const [updatingUnit, setUpdatingUnit] = useState(false);
  const [updatingBenchmark, setUpdatingBenchmark] = useState(false);

  const handleDistanceUnitChange = async (unit: "yards" | "meters") => {
    if (unit === user?.distanceUnit) return;
    setUpdatingUnit(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name ?? "",
          city: user?.city ?? "",
          country: user?.country ?? "",
          distanceUnit: unit,
        }),
      });
      if (res.ok) {
        await refreshUser();
        toast.success(`Distance units set to ${unit}`);
      }
    } catch {
      toast.error("Failed to update distance unit");
    } finally {
      setUpdatingUnit(false);
    }
  };

  const handleBenchmarkChange = async (level: BenchmarkLevel) => {
    if (level === user?.benchmarkLevel) return;
    setUpdatingBenchmark(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name ?? "",
          city: user?.city ?? "",
          country: user?.country ?? "",
          benchmarkLevel: level,
        }),
      });
      if (res.ok) {
        await refreshUser();
        toast.success(`Benchmark set to ${BENCHMARK_LABELS[level]}`);
      }
    } catch {
      toast.error("Failed to update benchmark level");
    } finally {
      setUpdatingBenchmark(false);
    }
  };

  const handleExport = () => {
    const data: ExportData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      rounds,
      goals,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jolf-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rounds.length} rounds and ${goals.length} goals`);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text) as ExportData;

        if (!data.rounds || !Array.isArray(data.rounds)) {
          toast.error("Invalid backup file — no rounds found");
          return;
        }

        const existingIds = new Set(rounds.map((r) => r.id));
        let importedRounds = 0;
        let importedGoals = 0;

        for (const round of data.rounds) {
          if (!existingIds.has(round.id)) {
            addRound(round);
            importedRounds++;
          }
        }

        if (data.goals && Array.isArray(data.goals)) {
          const existingGoalIds = new Set(goals.map((g) => g.id));
          for (const goal of data.goals) {
            if (!existingGoalIds.has(goal.id)) {
              addGoal(goal);
              importedGoals++;
            }
          }
        }

        toast.success(
          `Imported ${importedRounds} new rounds and ${importedGoals} new goals`
        );
      } catch {
        toast.error("Failed to read backup file");
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  return (
    <>
      <div>
        <PageHeader
          title="Settings"
          description="Manage your data and preferences"
        />

        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme for the dashboard.
              </p>
              <ThemeToggle />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distance Units</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose whether distances are shown in yards/feet or meters.
              </p>
              <div className="flex gap-3">
                <Button
                  variant={user?.distanceUnit !== "meters" ? "default" : "outline"}
                  onClick={() => handleDistanceUnitChange("yards")}
                  disabled={updatingUnit}
                >
                  Yards / Feet
                </Button>
                <Button
                  variant={user?.distanceUnit === "meters" ? "default" : "outline"}
                  onClick={() => handleDistanceUnitChange("meters")}
                  disabled={updatingUnit}
                >
                  Meters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Benchmark Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose who you compare your Strokes Gained against. Change this as your game improves.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {BENCHMARK_LEVELS.map((level) => (
                  <Button
                    key={level}
                    variant={(user?.benchmarkLevel ?? "pga-tour") === level ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleBenchmarkChange(level)}
                    disabled={updatingBenchmark}
                  >
                    {BENCHMARK_LABELS[level]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export your rounds and goals as a JSON file for safekeeping.
                Import to restore data on a new device or after clearing your
                browser.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleExport} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data ({rounds.length} rounds)
                </Button>
                <Button
                  onClick={handleImport}
                  variant="outline"
                  disabled={importing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {importing ? "Importing..." : "Import Backup"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demo Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Remove the 10 pre-loaded demo rounds. This only deletes seed
                data — your manually entered rounds are kept.
              </p>
              <Button
                onClick={() => {
                  clearSeedData();
                  toast.success("Seed data removed");
                }}
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Seed Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
