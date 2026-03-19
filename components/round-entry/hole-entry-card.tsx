"use client";

import { HoleData, FairwayHit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
      <Label className="text-xs text-muted-foreground w-14">{label}</Label>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-8 text-center font-bold tabular-nums">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="h-3 w-3" />
      </Button>
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
      <CardContent className="pt-4 pb-3 px-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center">
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
                scoreToPar < 0 && "text-green-600",
                scoreToPar === 0 && "text-foreground",
                scoreToPar > 0 && "text-red-500"
              )}
            >
              {hole.score}
            </span>
            {scoreToPar !== 0 && (
              <span
                className={cn(
                  "text-xs",
                  scoreToPar < 0 ? "text-green-600" : "text-red-500"
                )}
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
          <Label className="text-xs text-muted-foreground w-14">Fairway</Label>
          <div className="flex gap-1">
            {(["yes", "no", "na"] as const).map((val) => (
              <Button
                key={val}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs",
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
          <Label className="text-xs text-muted-foreground w-14">GIR</Label>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-8 px-3 text-xs",
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
                "h-8 px-3 text-xs",
                !hole.greenInRegulation && "bg-red-500 text-white border-red-500 hover:bg-red-600"
              )}
              onClick={() => update({ greenInRegulation: false })}
            >
              No
            </Button>
          </div>
        </div>

        {/* Putts */}
        <div className="flex items-center gap-4">
          <NumberStepper
            label="Putts"
            value={hole.putts}
            onChange={(v) => update({ putts: v })}
            min={0}
            max={10}
          />
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">1st putt</Label>
            <Input
              type="number"
              value={hole.firstPuttDistance || ""}
              onChange={(e) =>
                update({
                  firstPuttDistance: parseInt(e.target.value) || 0,
                })
              }
              className="w-16 h-8 text-xs"
              placeholder="ft"
              min={0}
              max={120}
            />
            <span className="text-xs text-muted-foreground">ft</span>
          </div>
        </div>

        {/* Expandable section */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          {expanded ? "Less" : "More"} (penalties, up & down, sand)
        </button>

        {expanded && (
          <div className="space-y-3 pt-1 border-t border-border">
            <NumberStepper
              label="Penalty"
              value={hole.penaltyStrokes}
              onChange={(v) => update({ penaltyStrokes: v })}
              min={0}
              max={5}
            />

            <div className="flex items-center gap-4">
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

            <div className="flex items-center gap-4">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
