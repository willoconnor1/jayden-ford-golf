"use client";

import { HoleData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { holeScoreColor } from "@/lib/utils";

interface HoleSummaryCardProps {
  hole: HoleData;
  isLastHole: boolean;
  onNext: () => void;
  onBack?: () => void;
}

function scoreLabel(score: number, par: number): string {
  const diff = score - par;
  if (diff === 0) return "Par";
  if (diff === -3) return "Albatross";
  if (diff === -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double Bogey";
  if (diff === 3) return "Triple Bogey";
  return diff > 0 ? `+${diff}` : `${diff}`;
}

export function HoleSummaryCard({
  hole,
  isLastHole,
  onNext,
  onBack,
}: HoleSummaryCardProps) {
  const diff = hole.score - hole.par;
  const label = scoreLabel(hole.score, hole.par);

  return (
    <div className="space-y-4">
      <div className="text-xs font-medium text-muted-foreground">
        Hole {hole.holeNumber} Summary
      </div>

      {/* Score display */}
      <div className="flex items-center justify-center gap-3 py-3">
        <span
          className={cn(
            "text-4xl font-bold",
            holeScoreColor(hole.score - hole.par)
          )}
        >
          {hole.score}
        </span>
        <div className="text-left">
          <div className={cn("text-sm font-semibold", holeScoreColor(hole.score - hole.par))}>
            {label}
          </div>
          <div className="text-xs text-muted-foreground">Par {hole.par}</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {hole.par >= 4 && (
          <div className="flex justify-between border rounded-lg px-3 py-2">
            <span className="text-muted-foreground">Fairway</span>
            <span className={cn("font-medium", hole.fairwayHit === "yes" ? "text-green-600" : "text-red-500")}>
              {hole.fairwayHit === "yes" ? "Hit" : "Missed"}
            </span>
          </div>
        )}
        <div className="flex justify-between border rounded-lg px-3 py-2">
          <span className="text-muted-foreground">GIR</span>
          <span className={cn("font-medium", hole.greenInRegulation ? "text-green-600" : "text-red-500")}>
            {hole.greenInRegulation ? "Yes" : "No"}
          </span>
        </div>
        <div className="flex justify-between border rounded-lg px-3 py-2">
          <span className="text-muted-foreground">Putts</span>
          <span className="font-medium">{hole.putts}</span>
        </div>
        {hole.penaltyStrokes > 0 && (
          <div className="flex justify-between border rounded-lg px-3 py-2">
            <span className="text-muted-foreground">Penalties</span>
            <span className="font-medium text-red-500">{hole.penaltyStrokes}</span>
          </div>
        )}
        {hole.upAndDownAttempt && (
          <div className="flex justify-between border rounded-lg px-3 py-2">
            <span className="text-muted-foreground">Up & Down</span>
            <span className={cn("font-medium", hole.upAndDownConverted ? "text-green-600" : "text-red-500")}>
              {hole.upAndDownConverted ? "Yes" : "No"}
            </span>
          </div>
        )}
        {hole.sandSaveAttempt && (
          <div className="flex justify-between border rounded-lg px-3 py-2">
            <span className="text-muted-foreground">Sand Save</span>
            <span className={cn("font-medium", hole.sandSaveConverted ? "text-green-600" : "text-red-500")}>
              {hole.sandSaveConverted ? "Yes" : "No"}
            </span>
          </div>
        )}
      </div>

      {/* Shot replay */}
      {hole.shots && hole.shots.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Shots</div>
          <div className="space-y-0.5">
            {hole.shots.map((s, i) => (
              <div key={i} className="text-xs text-muted-foreground flex gap-2">
                <span className="w-4 text-right font-mono">{i + 1}.</span>
                <span className="capitalize">{s.club.replace("-", " ")}</span>
                {s.result && (
                  <span className="capitalize">→ {s.result.replace("-", " ")}</span>
                )}
              </div>
            ))}
            <div className="text-xs text-muted-foreground flex gap-2">
              <span className="w-4 text-right font-mono"></span>
              <span>{hole.putts} putt{hole.putts !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={onNext} className="flex-1">
          {isLastHole ? "Finish Round" : "Next Hole"}
        </Button>
      </div>
    </div>
  );
}
