"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { HoleScoreInput } from "./hole-score-input";
import type { LiveEventData, LivePlayer } from "@/lib/types";

interface ScoreEntryFormProps {
  data: LiveEventData;
  playerId: string;
}

export function ScoreEntryForm({ data, playerId }: ScoreEntryFormProps) {
  const { event, players, scores } = data;

  // Find my group
  const myPlayer = players.find((p) => p.id === playerId);
  const myGroup = myPlayer?.groupNumber;
  const groupPlayers = useMemo(
    () => players.filter((p) => p.groupNumber === myGroup),
    [players, myGroup]
  );

  // Determine current hole: highest hole with scores for this group + 1
  const maxHoleWithScores = useMemo(() => {
    const groupPlayerIds = new Set(groupPlayers.map((p) => p.id));
    const groupScores = scores.filter((s) => groupPlayerIds.has(s.playerId));
    if (groupScores.length === 0) return 0;

    // Find highest hole where ALL group players have a score
    for (let h = 18; h >= 1; h--) {
      const allHaveScore = groupPlayers.every((p) =>
        groupScores.some((s) => s.playerId === p.id && s.holeNumber === h)
      );
      if (allHaveScore) return h;
    }
    return 0;
  }, [groupPlayers, scores]);

  const [currentHole, setCurrentHole] = useState(
    Math.min(maxHoleWithScores + 1, 18)
  );

  // Initialize scores for current hole from existing scores or default to par
  const [holeScores, setHoleScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const p of groupPlayers) {
      const existingScore = scores.find(
        (s) => s.playerId === p.id && s.holeNumber === currentHole
      );
      initial[p.id] = existingScore?.strokes ?? event.holePars[currentHole - 1];
    }
    return initial;
  });

  const [submitting, setSubmitting] = useState(false);

  // Update scores when navigating holes
  function navigateToHole(hole: number) {
    setCurrentHole(hole);
    const initial: Record<string, number> = {};
    for (const p of groupPlayers) {
      const existingScore = scores.find(
        (s) => s.playerId === p.id && s.holeNumber === hole
      );
      initial[p.id] = existingScore?.strokes ?? event.holePars[hole - 1];
    }
    setHoleScores(initial);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const scoreEntries = groupPlayers.map((p) => ({
        playerId: p.id,
        holeNumber: currentHole,
        strokes: holeScores[p.id] ?? event.holePars[currentHole - 1],
      }));

      const res = await fetch(`/api/live/events/${event.id}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: scoreEntries }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      toast.success(`Hole ${currentHole} submitted!`);

      if (currentHole < 18) {
        navigateToHole(currentHole + 1);
      } else {
        toast.success("Round complete!");
      }
    } catch {
      toast.error("Failed to submit scores");
    } finally {
      setSubmitting(false);
    }
  }

  const par = event.holePars[currentHole - 1];
  const isComplete = currentHole === 18 && maxHoleWithScores >= 18;

  return (
    <div className="space-y-4">
      {/* Hole Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          disabled={currentHole <= 1}
          onClick={() => navigateToHole(currentHole - 1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-2xl font-bold">Hole {currentHole}</p>
          <Badge variant="secondary">Par {par}</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={currentHole >= 18}
          onClick={() => navigateToHole(currentHole + 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Group Info */}
      <p className="text-xs text-white/60 text-center">
        Group {myGroup}
      </p>

      {/* Score Inputs */}
      <Card>
        <CardContent className="pt-4">
          {groupPlayers.map((player) => (
            <HoleScoreInput
              key={player.id}
              playerName={player.name}
              score={holeScores[player.id] ?? par}
              par={par}
              onChange={(score) =>
                setHoleScores((prev) => ({ ...prev, [player.id]: score }))
              }
            />
          ))}
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? "Submitting..."
          : currentHole === 18
            ? "Submit Final Hole"
            : "Submit & Next Hole"}
      </Button>

      {/* Leaderboard Link */}
      <Link href={`/live/${event.id}/leaderboard`}>
        <Button variant="outline" className="w-full" size="lg">
          <Trophy className="mr-2 h-4 w-4" />
          View Leaderboard
        </Button>
      </Link>

      {/* Hole Progress */}
      <div className="flex gap-1 justify-center flex-wrap">
        {Array.from({ length: 18 }, (_, i) => i + 1).map((hole) => {
          const allScored = groupPlayers.every((p) =>
            scores.some((s) => s.playerId === p.id && s.holeNumber === hole)
          );
          return (
            <button
              key={hole}
              onClick={() => navigateToHole(hole)}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                hole === currentHole
                  ? "bg-primary text-primary-foreground"
                  : allScored
                    ? "bg-muted text-foreground"
                    : "bg-background border text-white/60"
              }`}
            >
              {hole}
            </button>
          );
        })}
      </div>
    </div>
  );
}
