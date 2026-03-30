"use client";

import { cn } from "@/lib/utils";
import { TeeViewMode } from "@/lib/stats/dispersion";

const MODES: { value: TeeViewMode; label: string }[] = [
  { value: "scatter", label: "Dots" },
  { value: "heatmap", label: "Heatmap" },
  { value: "beeswarm", label: "Beeswarm" },
  { value: "histogram", label: "Histogram" },
];

interface ViewModeSwitcherProps {
  value: TeeViewMode;
  onChange: (mode: TeeViewMode) => void;
  shotCount: number;
}

export function ViewModeSwitcher({ value, onChange, shotCount }: ViewModeSwitcherProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MODES.map((mode) => {
        const disabled = mode.value !== "scatter" && shotCount < 5;
        return (
          <button
            key={mode.value}
            onClick={() => !disabled && onChange(mode.value)}
            disabled={disabled}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
              value === mode.value
                ? "bg-primary text-primary-foreground border-primary"
                : disabled
                  ? "bg-card/30 text-muted-foreground border-border cursor-not-allowed"
                  : "bg-card/60 text-muted-foreground border-border hover:bg-card/80"
            )}
            title={disabled ? "Need at least 5 shots" : undefined}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
