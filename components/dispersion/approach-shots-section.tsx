"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Club } from "@/lib/types";
import { EnrichedApproachShot, calculateDispersion } from "@/lib/stats/dispersion";
import { CircularGridSvg } from "./circular-grid-svg";
import { ClubColorLegend } from "./club-color-legend";
import { StatCardsRow } from "./stat-cards-row";

interface ApproachShotsSectionProps {
  shots: EnrichedApproachShot[];
  selectedClubs: Club[];
}

export function ApproachShotsSection({
  shots,
  selectedClubs,
}: ApproachShotsSectionProps) {
  const stats = useMemo(() => calculateDispersion(shots), [shots]);
  const clubsInData = useMemo(() => {
    const set = new Set<Club>();
    for (const s of shots) set.add(s.club);
    return selectedClubs.filter((c) => set.has(c));
  }, [shots, selectedClubs]);

  if (shots.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No approach shots match the current filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Approach Shots
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({shots.length} shot{shots.length !== 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CircularGridSvg shots={shots} />

          {clubsInData.length > 1 && (
            <div className="mt-3 pt-3 border-t border-border">
              <ClubColorLegend clubs={clubsInData} />
            </div>
          )}
        </CardContent>
      </Card>

      {stats && <StatCardsRow stats={stats} />}
    </div>
  );
}
