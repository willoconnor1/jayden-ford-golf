"use client";

import { ShotData, Club, ShotLie, AbnormalLieDetail } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLUBS, SHOT_LIES, ABNORMAL_DETAILS } from "@/lib/constants-clubs";
import { ShotMissInput } from "./shot-miss-input";

interface ShotEntryCardProps {
  shotIndex: number;
  shot: ShotData;
  onChange: (shot: ShotData) => void;
}

export function ShotEntryCard({ shotIndex, shot, onChange }: ShotEntryCardProps) {
  const update = (partial: Partial<ShotData>) => {
    onChange({ ...shot, ...partial });
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
        {/* Lie */}
        <div className="space-y-1">
          <Label className="text-xs">Lie</Label>
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

      {/* Drag-to-miss */}
      <ShotMissInput
        missX={shot.missX}
        missY={shot.missY}
        onChange={(missX, missY) => update({ missX, missY })}
      />
    </div>
  );
}
