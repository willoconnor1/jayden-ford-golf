"use client";

import { EntryMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EntryModeSelectorProps {
  value: EntryMode;
  onChange: (mode: EntryMode) => void;
}

const MODES: { value: EntryMode; title: string; subtitle: string }[] = [
  {
    value: "simple",
    title: "Simple",
    subtitle: "Score, fairway, GIR, putts per hole",
  },
  {
    value: "standard",
    title: "Standard",
    subtitle: "Shot-by-shot with quick pills",
  },
  {
    value: "detailed",
    title: "Detailed",
    subtitle: "Shot-by-shot + visual miss trackers",
  },
];

export function EntryModeSelector({ value, onChange }: EntryModeSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Entry Mode</div>
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors text-center",
              value === mode.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            )}
          >
            <span className="text-sm font-semibold">{mode.title}</span>
            <span className="text-[10px] leading-tight text-muted-foreground">
              {mode.subtitle}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
