"use client";

import { PuttMissDirection, PuttSpeed, PuttBreak, PuttSlope } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PillSelector } from "./pill-selector";
import { PuttMissInput } from "./putt-miss-input";
import {
  PUTT_BREAKS,
  PUTT_SLOPES,
  PUTT_SPEEDS,
} from "@/lib/constants-clubs";
import { cn } from "@/lib/utils";

export interface PuttData {
  distance: number;
  puttBreak?: PuttBreak;
  puttSlope?: PuttSlope;
  made: boolean;
  missDirection?: PuttMissDirection;
  speed?: PuttSpeed;
  missX: number;
  missY: number;
}

interface PuttStepCardProps {
  puttNumber: number;
  putt: PuttData;
  onChange: (putt: PuttData) => void;
  onComplete: () => void;
  onBack?: () => void;
  isDetailed: boolean;
}

const MISS_DIRECTIONS: { value: PuttMissDirection; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "good-line", label: "Good Line" },
  { value: "right", label: "Right" },
];

export function PuttStepCard({
  puttNumber,
  putt,
  onChange,
  onComplete,
  onBack,
  isDetailed,
}: PuttStepCardProps) {
  const update = (partial: Partial<PuttData>) => {
    onChange({ ...putt, ...partial });
  };

  const canComplete = putt.distance > 0;

  return (
    <div className="space-y-4">
      <div className="text-xs font-medium text-muted-foreground">
        Putt {puttNumber}
      </div>

      {/* Distance */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground">
          Distance (feet)
        </div>
        <Input
          type="number"
          value={putt.distance || ""}
          onChange={(e) => update({ distance: parseInt(e.target.value) || 0 })}
          className="h-10 text-sm"
          placeholder="20"
          min={0}
          max={100}
        />
      </div>

      {/* Break */}
      <PillSelector
        label="Break"
        options={PUTT_BREAKS}
        value={putt.puttBreak}
        onChange={(v) => update({ puttBreak: v as PuttBreak })}
        columns={4}
        activeColor="bg-primary"
        allowDeselect
      />

      {/* Slope */}
      <PillSelector
        label="Slope"
        options={PUTT_SLOPES}
        value={putt.puttSlope}
        onChange={(v) => update({ puttSlope: v as PuttSlope })}
        columns={4}
        activeColor="bg-amber-600"
        allowDeselect
      />

      {/* Made / Missed */}
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-muted-foreground">Result</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              update({ made: true, missDirection: undefined, speed: undefined, missX: 0, missY: 0 })
            }
            className={cn(
              "py-3 text-sm font-semibold rounded-lg border-2 transition-colors",
              putt.made
                ? "bg-primary text-white border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            )}
          >
            Made
          </button>
          <button
            type="button"
            onClick={() => update({ made: false })}
            className={cn(
              "py-3 text-sm font-semibold rounded-lg border-2 transition-colors",
              !putt.made
                ? "bg-red-600 text-white border-red-600"
                : "bg-background border-border text-muted-foreground hover:border-red-300"
            )}
          >
            Missed
          </button>
        </div>
      </div>

      {/* Miss details — only when missed */}
      {!putt.made && (
        <>
          <PillSelector
            label="Miss Direction"
            options={MISS_DIRECTIONS}
            value={putt.missDirection}
            onChange={(v) => update({ missDirection: v as PuttMissDirection })}
            columns={3}
            activeColor="bg-amber-600"
            allowDeselect
          />

          <PillSelector
            label="Speed"
            options={PUTT_SPEEDS}
            value={putt.speed}
            onChange={(v) => update({ speed: v as PuttSpeed })}
            columns={3}
            activeColor="bg-blue-600"
            allowDeselect
          />

          {/* Visual miss tracker — Detailed mode only */}
          {isDetailed && (
            <PuttMissInput
              missX={putt.missX}
              missY={putt.missY}
              onChange={(missX, missY) => update({ missX, missY })}
            />
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={onComplete}
          disabled={!canComplete}
          className="flex-1"
        >
          {putt.made ? "Hole Summary" : "Next Putt"}
        </Button>
      </div>
    </div>
  );
}
