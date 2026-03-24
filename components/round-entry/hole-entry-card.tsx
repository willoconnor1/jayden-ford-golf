"use client";

import { HoleData, FairwayHit, ShotData, ShotResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus, ChevronDown, ChevronUp, Crosshair } from "lucide-react";
import { useState } from "react";
import { cn, holeScoreColor } from "@/lib/utils";
import { ShotEntryCard } from "./shot-entry-card";
import { PuttMissInput } from "./putt-miss-input";

interface HoleEntryCardProps {
  hole: HoleData;
  onChange: (hole: HoleData) => void;
}

function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 20,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground w-12 shrink-0">{label}</Label>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-8 text-center font-bold tabular-nums text-base">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function defaultShot(isFirst = false, par = 4): ShotData {
  if (isFirst && par !== 3) {
    return { club: "driver", targetDistance: 250, lie: "tee", missX: 0, missY: 0 };
  }
  return { club: "7-iron", targetDistance: 150, lie: "fairway", missX: 0, missY: 0 };
}

/** Map a shot result to the next shot's lie */
function resultToLie(result: ShotResult, currentLie: ShotData["lie"]): { lie: ShotData["lie"]; abnormalDetail?: ShotData["abnormalDetail"] } {
  switch (result) {
    case "fairway": return { lie: "fairway" };
    case "rough": return { lie: "rough" };
    case "penalty-area": return { lie: "penalty-area" };
    case "tree-trouble": return { lie: "abnormal", abnormalDetail: "in-trees" };
    case "abnormal": return { lie: "abnormal" };
    case "out-of-bounds": return { lie: currentLie }; // re-hit from same spot
  }
}

function ShotTrackingSection({
  hole,
  update,
}: {
  hole: HoleData;
  update: (partial: Partial<HoleData>) => void;
}) {
  const [showShots, setShowShots] = useState((hole.shots?.length ?? 0) > 0);
  const nonPuttShots = Math.max(0, hole.score - hole.putts);
  const shots = hole.shots || [];

  const toggleShots = () => {
    if (showShots) {
      update({ shots: undefined });
      setShowShots(false);
    } else {
      const newShots = Array.from({ length: nonPuttShots }, (_, i) =>
        defaultShot(i === 0, hole.par)
      );
      update({ shots: newShots });
      setShowShots(true);
    }
  };

  const updateShot = (index: number, shot: ShotData) => {
    const newShots = [...shots];
    newShots[index] = shot;

    // Auto-populate next shot's lie from this shot's result
    if (shot.result && index + 1 < newShots.length) {
      const { lie, abnormalDetail } = resultToLie(shot.result, shot.lie);
      newShots[index + 1] = { ...newShots[index + 1], lie, abnormalDetail };
    }

    update({ shots: newShots });
  };

  // Sync shot count if score/putts changes
  const expectedCount = nonPuttShots;
  if (showShots && shots.length !== expectedCount) {
    const synced =
      shots.length < expectedCount
        ? [...shots, ...Array.from({ length: expectedCount - shots.length }, () => defaultShot())]
        : shots.slice(0, expectedCount);
    update({ shots: synced });
  }

  return (
    <div className="space-y-2 pt-2 border-t border-border/50">
      <button
        type="button"
        onClick={toggleShots}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Crosshair className="h-3.5 w-3.5" />
        {showShots ? "Remove shot tracking" : `Track ${nonPuttShots} shot${nonPuttShots !== 1 ? "s" : ""}`}
      </button>

      {showShots && shots.length > 0 && (
        <div className="space-y-2">
          {shots.map((shot, i) => (
            <ShotEntryCard
              key={i}
              shotIndex={i}
              shot={shot}
              onChange={(s) => updateShot(i, s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HoleEntryCard({ hole, onChange }: HoleEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const scoreToPar = hole.score - hole.par;

  const update = (partial: Partial<HoleData>) => {
    const updated = { ...hole, ...partial };

    // Auto-set fairway N/A for par 3
    if (partial.par === 3 && hole.par !== 3) {
      updated.fairwayHit = "na";
    }

    // Auto-suggest up-and-down attempt when GIR missed
    if ("greenInRegulation" in partial && !partial.greenInRegulation) {
      updated.upAndDownAttempt = true;
    }

    onChange(updated);
  };

  return (
    <Card className={cn("transition-shadow", expanded && "shadow-md")}>
      <CardContent className="pt-3 pb-3 px-3 sm:px-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center shrink-0">
              {hole.holeNumber}
            </span>
            <span className="text-sm text-muted-foreground">
              Par {hole.par}
            </span>
            {hole.distance > 0 && (
              <span className="text-xs text-muted-foreground">
                {hole.distance} yds
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "text-lg font-bold tabular-nums",
                holeScoreColor(scoreToPar)
              )}
            >
              {hole.score}
            </span>
            {scoreToPar !== 0 && (
              <span
                className={cn("text-xs", holeScoreColor(scoreToPar))}
              >
                ({scoreToPar > 0 ? "+" : ""}
                {scoreToPar})
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <NumberStepper
          label="Score"
          value={hole.score}
          onChange={(v) => update({ score: v })}
          min={1}
          max={15}
        />

        {/* Fairway */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-12 shrink-0">Fairway</Label>
          <div className="flex gap-1.5">
            {(["yes", "no", "na"] as const).map((val) => (
              <Button
                key={val}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 px-3.5 text-xs",
                  hole.fairwayHit === val && val === "yes" && "bg-green-600 text-white border-green-600 hover:bg-green-700",
                  hole.fairwayHit === val && val === "no" && "bg-red-500 text-white border-red-500 hover:bg-red-600",
                  hole.fairwayHit === val && val === "na" && "bg-muted border-muted",
                )}
                disabled={val === "na" && hole.par !== 3}
                onClick={() => update({ fairwayHit: val })}
              >
                {val === "na" ? "N/A" : val === "yes" ? "Yes" : "No"}
              </Button>
            ))}
          </div>
        </div>

        {/* GIR */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-12 shrink-0">GIR</Label>
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-9 px-3.5 text-xs",
                hole.greenInRegulation && "bg-green-600 text-white border-green-600 hover:bg-green-700"
              )}
              onClick={() => update({ greenInRegulation: true })}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-9 px-3.5 text-xs",
                !hole.greenInRegulation && "bg-red-500 text-white border-red-500 hover:bg-red-600"
              )}
              onClick={() => update({ greenInRegulation: false })}
            >
              No
            </Button>
          </div>
        </div>

        {/* Putts */}
        <div className="space-y-2">
          <NumberStepper
            label="Putts"
            value={hole.putts}
            onChange={(v) => {
              const prev = hole.puttDistances || [];
              const puttDistances =
                v > prev.length
                  ? [...prev, ...Array(v - prev.length).fill(0)]
                  : prev.slice(0, v);
              // Sync puttMisses: misses are for putts 0..n-2, so max length is v-1
              const prevMisses = hole.puttMisses || [];
              const missCount = Math.max(0, v - 1);
              const puttMisses =
                missCount > prevMisses.length
                  ? [...prevMisses, ...Array.from({ length: missCount - prevMisses.length }, () => ({ missX: 0, missY: 0 }))]
                  : prevMisses.slice(0, missCount);
              update({ putts: v, puttDistances, puttMisses });
            }}
            min={0}
            max={10}
          />
          {hole.putts > 0 && (
            <div className="space-y-2 pl-14">
              {Array.from({ length: hole.putts }).map((_, i) => {
                const ordinal =
                  i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}th`;
                const isMiss = i < hole.putts - 1;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-muted-foreground shrink-0 w-14">
                        {ordinal} putt
                      </Label>
                      <Input
                        type="number"
                        value={(hole.puttDistances || [])[i] || ""}
                        onChange={(e) => {
                          const newDists = [...(hole.puttDistances || [])];
                          while (newDists.length <= i) newDists.push(0);
                          newDists[i] = parseInt(e.target.value) || 0;
                          update({ puttDistances: newDists });
                        }}
                        className="w-16 h-8 text-xs"
                        placeholder="ft"
                        min={0}
                        max={120}
                      />
                      <span className="text-xs text-muted-foreground">ft</span>
                      {isMiss && (
                        <span className="text-xs text-amber-600 font-medium">miss</span>
                      )}
                      {!isMiss && hole.putts > 1 && (
                        <span className="text-xs text-green-600 font-medium">made</span>
                      )}
                    </div>
                    {isMiss && (
                      <PuttMissInput
                        missX={(hole.puttMisses || [])[i]?.missX ?? 0}
                        missY={(hole.puttMisses || [])[i]?.missY ?? 0}
                        onChange={(missX, missY) => {
                          const newMisses = [...(hole.puttMisses || [])];
                          while (newMisses.length <= i) newMisses.push({ missX: 0, missY: 0 });
                          newMisses[i] = { missX, missY };
                          update({ puttMisses: newMisses });
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expandable section */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-1"
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          {expanded ? "Less" : "More"} (penalties, up & down, sand, shots)
        </button>

        {expanded && (
          <div className="space-y-3 pt-2 border-t border-border">
            <NumberStepper
              label="Penalty"
              value={hole.penaltyStrokes}
              onChange={(v) => update({ penaltyStrokes: v })}
              min={0}
              max={5}
            />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">
                  Up & Down
                </Label>
                <Switch
                  checked={hole.upAndDownAttempt}
                  onCheckedChange={(v) => update({ upAndDownAttempt: v, upAndDownConverted: false })}
                />
              </div>
              {hole.upAndDownAttempt && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Converted
                  </Label>
                  <Switch
                    checked={hole.upAndDownConverted}
                    onCheckedChange={(v) =>
                      update({ upAndDownConverted: v })
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">
                  Sand Save
                </Label>
                <Switch
                  checked={hole.sandSaveAttempt}
                  onCheckedChange={(v) => update({ sandSaveAttempt: v, sandSaveConverted: false })}
                />
              </div>
              {hole.sandSaveAttempt && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Saved
                  </Label>
                  <Switch
                    checked={hole.sandSaveConverted}
                    onCheckedChange={(v) =>
                      update({ sandSaveConverted: v })
                    }
                  />
                </div>
              )}
            </div>

            {/* Shot tracking */}
            <ShotTrackingSection hole={hole} update={update} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
