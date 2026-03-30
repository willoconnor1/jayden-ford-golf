"use client";

import { Club } from "@/lib/types";
import { CLUBS, CLUB_COLORS } from "@/lib/constants-clubs";

interface ClubColorLegendProps {
  clubs: Club[];
}

export function ClubColorLegend({ clubs }: ClubColorLegendProps) {
  if (clubs.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-1">
      {clubs.map((club) => {
        const label = CLUBS.find((c) => c.value === club)?.label ?? club;
        return (
          <div key={club} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: CLUB_COLORS[club] }}
            />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
