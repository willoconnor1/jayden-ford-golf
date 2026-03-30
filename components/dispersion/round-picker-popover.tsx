"use client";

import { useState } from "react";
import { Round } from "@/lib/types";
import { RoundSelection } from "@/lib/stats/dispersion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PRESETS = [5, 10, 20, 50];

interface RoundPickerPopoverProps {
  rounds: Round[];
  selection: RoundSelection;
  onChange: (sel: RoundSelection) => void;
}

export function RoundPickerPopover({
  rounds,
  selection,
  onChange,
}: RoundPickerPopoverProps) {
  const [customN, setCustomN] = useState(
    selection.mode === "lastN" ? selection.lastN : 20
  );

  const sortedRounds = [...rounds].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleRound = (roundId: string) => {
    const current = selection.mode === "custom" ? selection.roundIds : [];
    const next = current.includes(roundId)
      ? current.filter((id) => id !== roundId)
      : [...current, roundId];
    onChange({ mode: "custom", lastN: 0, roundIds: next });
  };

  const isLastN = selection.mode === "lastN";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() =>
            onChange({ mode: "all", lastN: 0, roundIds: [] })
          }
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
            selection.mode === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card/60 text-muted-foreground border-border hover:bg-card/80"
          )}
        >
          All
        </button>
        {PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => {
              setCustomN(n);
              onChange({ mode: "lastN", lastN: n, roundIds: [] });
            }}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
              isLastN && selection.lastN === n
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card/60 text-muted-foreground border-border hover:bg-card/80"
            )}
          >
            Last {n}
          </button>
        ))}

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Last</span>
          <input
            type="number"
            min={1}
            max={999}
            value={customN}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 1;
              setCustomN(v);
              onChange({ mode: "lastN", lastN: v, roundIds: [] });
            }}
            className="w-12 h-7 text-center text-xs rounded-md border border-border bg-card/60 text-foreground tabular-nums focus:outline-none focus:border-primary"
          />
        </div>

        <Popover>
          <PopoverTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-7 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
              {selection.mode === "custom" && selection.roundIds.length > 0
                ? `${selection.roundIds.length} round${selection.roundIds.length !== 1 ? "s" : ""}`
                : "Pick Rounds"}
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-64 overflow-y-auto p-2" align="start">
            <p className="text-xs text-muted-foreground px-2 mb-2">
              Select individual rounds
            </p>
            {sortedRounds.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No rounds</p>
            ) : (
              sortedRounds.map((round) => {
                const checked =
                  selection.mode === "custom" &&
                  selection.roundIds.includes(round.id);
                const dateStr = new Date(round.date).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                );
                return (
                  <label
                    key={round.id}
                    className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-foreground/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRound(round.id)}
                      className="accent-[hsl(var(--primary))] h-3.5 w-3.5 rounded"
                    />
                    <span className="text-xs text-foreground truncate flex-1">
                      {round.course.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {dateStr}
                    </span>
                  </label>
                );
              })
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
