"use client";

import { ShotData, Club, ShotResult, ShotDirection, ShotIntent, HoleShape } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PillSelector } from "./pill-selector";
import { DriverMissInput } from "./driver-miss-input";
import { ShotMissInput } from "./shot-miss-input";
import {
  CLUBS,
  HOLE_SHAPES,
  SHOT_DIRECTIONS,
  SHOT_INTENTS,
  TEE_SHOT_RESULTS_PAR45,
  TEE_SHOT_RESULTS_PAR3,
  APPROACH_SHOT_RESULTS,
} from "@/lib/constants-clubs";

interface ShotStepCardProps {
  shotNumber: number;
  shot: ShotData;
  par: number;
  isTeeShot: boolean;
  holeShape?: HoleShape;
  onHoleShapeChange?: (shape: HoleShape) => void;
  onChange: (shot: ShotData) => void;
  onComplete: () => void;
  onBack?: () => void;
  isDetailed: boolean;
}

export function ShotStepCard({
  shotNumber,
  shot,
  par,
  isTeeShot,
  holeShape,
  onHoleShapeChange,
  onChange,
  onComplete,
  onBack,
  isDetailed,
}: ShotStepCardProps) {
  const isDriver = shot.club === "driver";
  const isPar3Tee = isTeeShot && par === 3;
  const isPar45Tee = isTeeShot && par >= 4;

  const update = (partial: Partial<ShotData>) => {
    const updated = { ...shot, ...partial };
    if (partial.club === "driver") {
      updated.lie = "tee";
      updated.missY = 0;
    }
    onChange(updated);
  };

  const resultOptions = isPar45Tee
    ? TEE_SHOT_RESULTS_PAR45
    : isPar3Tee
    ? TEE_SHOT_RESULTS_PAR3
    : APPROACH_SHOT_RESULTS;

  const canComplete = !!shot.result;

  return (
    <div className="space-y-4">
      {/* Shot label */}
      <div className="text-xs font-medium text-muted-foreground">
        Shot {shotNumber}
        {!isTeeShot && (
          <span className="ml-1 capitalize">· {shot.lie.replace("-", " ")}</span>
        )}
      </div>

      {/* Hole Shape — tee shots on par 4/5 only */}
      {isPar45Tee && onHoleShapeChange && (
        <PillSelector
          label="Hole Shape"
          options={HOLE_SHAPES}
          value={holeShape}
          onChange={onHoleShapeChange}
          columns={3}
          activeColor="bg-slate-600"
        />
      )}

      {/* Club selector */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground">Club</div>
        <select
          value={shot.club}
          onChange={(e) => update({ club: e.target.value as Club })}
          className="w-full border rounded-lg bg-background h-10 text-sm px-3"
        >
          {CLUBS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Intent — approach and par 3 tee shots */}
      {(!isTeeShot || isPar3Tee) && (
        <PillSelector
          label="Intent"
          options={SHOT_INTENTS}
          value={shot.intent}
          onChange={(v) => update({ intent: v as ShotIntent })}
          columns={3}
          activeColor="bg-violet-600"
        />
      )}

      {/* Direction */}
      <PillSelector
        label="Direction"
        options={SHOT_DIRECTIONS}
        value={shot.direction}
        onChange={(v) => update({ direction: v as ShotDirection })}
        columns={3}
        activeColor="bg-blue-600"
      />

      {/* Result */}
      <PillSelector
        label="Result"
        options={resultOptions}
        value={shot.result}
        onChange={(v) => update({ result: v as ShotResult })}
        columns={3}
        activeColor="bg-emerald-600"
      />

      {/* Distance remaining */}
      {shot.result && shot.result !== "green" && shot.result !== "holed" && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Distance Remaining (yds)
          </div>
          <Input
            type="number"
            value={shot.distanceRemaining || ""}
            onChange={(e) =>
              update({ distanceRemaining: parseInt(e.target.value) || 0 })
            }
            className="h-10 text-sm"
            placeholder="150"
            min={0}
            max={600}
          />
        </div>
      )}

      {/* Visual miss tracker — Detailed mode only */}
      {isDetailed && (
        <div className="pt-1">
          {isDriver ? (
            <DriverMissInput
              missX={shot.missX}
              onChange={(missX) => update({ missX, missY: 0 })}
            />
          ) : (
            <ShotMissInput
              missX={shot.missX}
              missY={shot.missY}
              onChange={(missX, missY) => update({ missX, missY })}
            />
          )}
        </div>
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
          {shot.result === "green" || shot.result === "holed"
            ? shot.result === "holed" ? "Hole Summary" : "Start Putting"
            : "Next Shot"}
        </Button>
      </div>
    </div>
  );
}
