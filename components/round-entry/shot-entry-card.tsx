"use client";

import { ShotData, Club, ShotLie, ShotResult, AbnormalLieDetail } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CLUBS, SHOT_LIES, SHOT_RESULTS, ABNORMAL_DETAILS } from "@/lib/constants-clubs";
import { ShotMissInput } from "./shot-miss-input";
import { DriverMissInput } from "./driver-miss-input";

interface ShotEntryCardProps {
  shotIndex: number;
  shot: ShotData;
  onChange: (shot: ShotData) => void;
}

const PENALTY_RESULTS: ShotResult[] = ["out-of-bounds", "penalty-area", "tree-trouble", "abnormal"];

export function ShotEntryCard({ shotIndex, shot, onChange }: ShotEntryCardProps) {
  const isDriver = shot.club === "driver";

  const update = (partial: Partial<ShotData>) => {
    const updated = { ...shot, ...partial };
    // Auto-set lie to tee when driver is selected
    if (partial.club === "driver") {
      updated.lie = "tee";
      updated.missY = 0; // driver is L/R only
    }
    onChange(updated);
  };

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-card">
      <div className="text-xs font-medium text-muted-foreground">
        Shot {shotIndex + 1}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Club */}
        <div className="space-y-1">
          <Label className="text-xs">Club</Label>
          <select
            value={shot.club}
            onChange={(e) => update({ club: e.target.value as Club })}
            className="w-full border rounded bg-background h-8 text-xs px-2"
          >
            {CLUBS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target Distance */}
        <div className="space-y-1">
          <Label className="text-xs">Target (yds)</Label>
          <Input
            type="number"
            value={shot.targetDistance || ""}
            onChange={(e) =>
              update({ targetDistance: parseInt(e.target.value) || 0 })
            }
            className="h-8 text-xs"
            placeholder="150"
            min={0}
            max={600}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Lie — auto-set for driver, dropdown for others */}
        <div className="space-y-1">
          <Label className="text-xs">Lie</Label>
          {isDriver ? (
            <div className="flex items-center h-8 text-xs text-muted-foreground px-2 border rounded bg-muted/50">
              Tee
            </div>
          ) : (
            <select
              value={shot.lie}
              onChange={(e) =>
                update({
                  lie: e.target.value as ShotLie,
                  abnormalDetail: e.target.value === "abnormal" ? "other" : undefined,
                })
              }
              className="w-full border rounded bg-background h-8 text-xs px-2"
            >
              {SHOT_LIES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Abnormal detail */}
        {shot.lie === "abnormal" && (
          <div className="space-y-1">
            <Label className="text-xs">Detail</Label>
            <select
              value={shot.abnormalDetail || "other"}
              onChange={(e) =>
                update({ abnormalDetail: e.target.value as AbnormalLieDetail })
              }
              className="w-full border rounded bg-background h-8 text-xs px-2"
            >
              {ABNORMAL_DETAILS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Result dropdown (for driver / tee shots) */}
      {isDriver && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Result</Label>
              <select
                value={shot.result || "fairway"}
                onChange={(e) => update({ result: e.target.value as ShotResult })}
                className="w-full border rounded bg-background h-8 text-xs px-2"
              >
                {SHOT_RESULTS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Penalty drop toggle for certain results */}
            {shot.result && PENALTY_RESULTS.includes(shot.result) && (
              <div className="space-y-1">
                <Label className="text-xs">Penalty Drop</Label>
                <div className="flex items-center h-8">
                  <Switch
                    checked={shot.penaltyDrop || false}
                    onCheckedChange={(v) => update({ penaltyDrop: v })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drag-to-miss — horizontal bar for driver, circular for others */}
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
  );
}
