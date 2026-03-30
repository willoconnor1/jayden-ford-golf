"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Club } from "@/lib/types";
import {
  EnrichedTeeShot,
  TeeViewMode,
  calculateDispersion,
} from "@/lib/stats/dispersion";
import { FairwayScatterSvg } from "./fairway-scatter-svg";
import { LeftRightStripSvg } from "./left-right-strip-svg";
import { HeatmapOverlay } from "./heatmap-overlay";
import { BeeswarmLayout } from "./beeswarm-layout";
import { HistogramStrip } from "./histogram-strip";
import { ViewModeSwitcher } from "./view-mode-switcher";
import { ClubColorLegend } from "./club-color-legend";
import { StatCardsRow } from "./stat-cards-row";
import { cn } from "@/lib/utils";

interface TeeShotsSectionProps {
  shots: EnrichedTeeShot[];
  viewMode: TeeViewMode;
  subView: "fairway" | "left-right";
  onViewModeChange: (mode: TeeViewMode) => void;
  onSubViewChange: (view: "fairway" | "left-right") => void;
  selectedClubs: Club[];
}

export function TeeShotsSection({
  shots,
  viewMode,
  subView,
  onViewModeChange,
  onSubViewChange,
  selectedClubs,
}: TeeShotsSectionProps) {
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
            No tee shots match the current filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">
              Tee Shots
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({shots.length} shot{shots.length !== 1 ? "s" : ""})
              </span>
            </CardTitle>
          </div>

          {/* Sub-view toggle */}
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => onSubViewChange("fairway")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                subView === "fairway"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/60 text-muted-foreground border-border hover:bg-card/80"
              )}
            >
              Fairway View
            </button>
            <button
              onClick={() => onSubViewChange("left-right")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                subView === "left-right"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/60 text-muted-foreground border-border hover:bg-card/80"
              )}
            >
              Left/Right Only
            </button>
          </div>

          {/* View mode switcher */}
          <div className="mt-2">
            <ViewModeSwitcher
              value={viewMode}
              onChange={onViewModeChange}
              shotCount={shots.length}
            />
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === "scatter" && subView === "fairway" && (
            <FairwayScatterSvg shots={shots} />
          )}
          {viewMode === "scatter" && subView === "left-right" && (
            <LeftRightStripSvg shots={shots} />
          )}
          {viewMode === "heatmap" && <HeatmapOverlay shots={shots} />}
          {viewMode === "beeswarm" && (
            <BeeswarmLayout shots={shots} mode={subView} />
          )}
          {viewMode === "histogram" && (
            <HistogramStrip shots={shots} selectedClubs={selectedClubs} />
          )}

          {/* Club legend */}
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
