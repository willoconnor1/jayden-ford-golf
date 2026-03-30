"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { PageBackground } from "@/components/layout/page-background";
import { useRoundStore } from "@/stores/round-store";
import { useHydration } from "@/hooks/use-hydration";
import { Club, ShotLie } from "@/lib/types";
import {
  RoundSelection,
  TeeViewMode,
  getUsedClubs,
  getUsedLies,
  getUniqueCourseNames,
  getTopUsedClubs,
  filterRoundsBySelection,
  filterRoundsByCourse,
  collectTeeShots,
  collectApproachShots,
} from "@/lib/stats/dispersion";
import { DispersionFilters } from "@/components/dispersion/dispersion-filters";
import { TeeShotsSection } from "@/components/dispersion/tee-shots-section";
import { ApproachShotsSection } from "@/components/dispersion/approach-shots-section";

export default function DispersionPage() {
  const hydrated = useHydration();
  const rounds = useRoundStore((s) => s.rounds);

  // Filter state
  const [selectedClubs, setSelectedClubs] = useState<Club[]>([]);
  const [selectedLies, setSelectedLies] = useState<ShotLie[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [roundSelection, setRoundSelection] = useState<RoundSelection>({
    mode: "lastN",
    lastN: 20,
    roundIds: [],
  });
  const [activeTab, setActiveTab] = useState("tee-shots");
  const [teeViewMode, setTeeViewMode] = useState<TeeViewMode>("scatter");
  const [teeSubView, setTeeSubView] = useState<"fairway" | "left-right">("fairway");

  // Derived data
  const usedClubs = useMemo(() => getUsedClubs(rounds), [rounds]);
  const usedLies = useMemo(() => getUsedLies(rounds), [rounds]);
  const uniqueCourseNames = useMemo(() => getUniqueCourseNames(rounds), [rounds]);

  // Auto-select top clubs on mount
  useEffect(() => {
    if (selectedClubs.length === 0 && usedClubs.length > 0) {
      setSelectedClubs(getTopUsedClubs(rounds, 3));
    }
  }, [usedClubs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter pipeline
  const filteredRounds = useMemo(() => {
    const bySelection = filterRoundsBySelection(rounds, roundSelection);
    return filterRoundsByCourse(bySelection, selectedCourses);
  }, [rounds, roundSelection, selectedCourses]);

  const teeShots = useMemo(
    () => collectTeeShots(filteredRounds, selectedClubs),
    [filteredRounds, selectedClubs]
  );

  const approachShots = useMemo(
    () => collectApproachShots(filteredRounds, selectedClubs, selectedLies),
    [filteredRounds, selectedClubs, selectedLies]
  );

  if (!hydrated) {
    return (
      <>
        <PageBackground image="/te-arai-south.jpg" />
        <div className="relative z-10 animate-pulse space-y-4">
          <div className="h-8 bg-muted/60 rounded w-48" />
          <div className="h-64 bg-muted/60 rounded-lg" />
        </div>
      </>
    );
  }

  const hasShots = usedClubs.length > 0;

  return (
    <>
      <PageBackground image="/te-arai-south.jpg" />
      <div className="relative z-10">
        <PageHeader
          title="Shot Dispersion"
          description="Analyze where your shots miss relative to your target"
        />

        {!hasShots ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-lg font-semibold mb-2">No shot data yet</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                When entering a round, expand the &quot;More&quot; section on each
                hole and click &quot;Track shots&quot; to record where each shot
                lands relative to your target.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <DispersionFilters
              rounds={rounds}
              selectedClubs={selectedClubs}
              onClubsChange={setSelectedClubs}
              selectedLies={selectedLies}
              onLiesChange={setSelectedLies}
              selectedCourses={selectedCourses}
              onCoursesChange={setSelectedCourses}
              roundSelection={roundSelection}
              onRoundSelectionChange={setRoundSelection}
              showLieFilter={activeTab === "approach"}
              availableClubs={usedClubs}
              availableLies={usedLies}
              uniqueCourseNames={uniqueCourseNames}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="tee-shots">
                  Tee Shots ({teeShots.length})
                </TabsTrigger>
                <TabsTrigger value="approach">
                  Approach ({approachShots.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tee-shots" className="mt-4">
                <TeeShotsSection
                  shots={teeShots}
                  viewMode={teeViewMode}
                  subView={teeSubView}
                  onViewModeChange={setTeeViewMode}
                  onSubViewChange={setTeeSubView}
                  selectedClubs={selectedClubs}
                />
              </TabsContent>

              <TabsContent value="approach" className="mt-4">
                <ApproachShotsSection
                  shots={approachShots}
                  selectedClubs={selectedClubs}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </>
  );
}
