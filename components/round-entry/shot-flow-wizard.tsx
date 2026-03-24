"use client";

import { useState, useCallback } from "react";
import { HoleData, ShotData, HoleShape, EntryMode } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ShotFlowHeader } from "./shot-flow-header";
import { ShotStepCard } from "./shot-step-card";
import { PuttStepCard, PuttData } from "./putt-step-card";
import { HoleSummaryCard } from "./hole-summary-card";
import { deriveHoleData, resultToNextLie } from "./derive-hole-data";

type Phase = "shot" | "putt" | "summary";

interface ShotFlowWizardProps {
  holePars: number[];
  holeDistances: number[];
  entryMode: EntryMode; // "standard" | "detailed"
  onComplete: (holes: HoleData[]) => void;
}

function defaultShot(lie: ShotData["lie"] = "tee", club: ShotData["club"] = "driver"): ShotData {
  return {
    club,
    targetDistance: 0,
    lie,
    missX: 0,
    missY: 0,
  };
}

function defaultPutt(): PuttData {
  return {
    distance: 0,
    made: false,
    missX: 0,
    missY: 0,
  };
}

export function ShotFlowWizard({
  holePars,
  holeDistances,
  entryMode,
  onComplete,
}: ShotFlowWizardProps) {
  const totalHoles = holePars.length;
  const isDetailed = entryMode === "detailed";

  // Per-hole state
  const [holeIndex, setHoleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("shot");
  const [shots, setShots] = useState<ShotData[]>([defaultShot("tee", "driver")]);
  const [putts, setPutts] = useState<PuttData[]>([]);
  const [holeShape, setHoleShape] = useState<HoleShape | undefined>();
  const [completedHoles, setCompletedHoles] = useState<HoleData[]>([]);
  const [summaryHole, setSummaryHole] = useState<HoleData | null>(null);

  // History stack for back navigation: each entry is a snapshot
  const [history, setHistory] = useState<
    Array<{ phase: Phase; shots: ShotData[]; putts: PuttData[] }>
  >([]);

  const par = holePars[holeIndex];
  const distance = holeDistances[holeIndex];
  const holeNumber = holeIndex + 1;

  const currentShotIndex = shots.length - 1;
  const currentPuttIndex = putts.length - 1;

  const pushHistory = useCallback(() => {
    setHistory((h) => [
      ...h,
      {
        phase,
        shots: shots.map((s) => ({ ...s })),
        putts: putts.map((p) => ({ ...p })),
      },
    ]);
  }, [phase, shots, putts]);

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setPhase(prev.phase);
      setShots(prev.shots);
      setPutts(prev.putts);
      return h.slice(0, -1);
    });
  }, []);

  // ── Shot handlers ──────────────────────────────────────────

  const handleShotChange = (updated: ShotData) => {
    setShots((prev) => {
      const next = [...prev];
      next[currentShotIndex] = updated;
      return next;
    });
  };

  const handleShotComplete = () => {
    const currentShot = shots[currentShotIndex];

    pushHistory();

    if (currentShot.result === "holed") {
      // Holed out — skip putting, go to summary
      const hole = deriveHoleData(holeNumber, par, distance, shots, [], holeShape);
      setSummaryHole(hole);
      setPhase("summary");
      return;
    }

    if (currentShot.result === "green") {
      // Reached green — start putting
      setPutts([defaultPutt()]);
      setPhase("putt");
      return;
    }

    // Next shot — auto-populate lie from result
    const nextLie = resultToNextLie(currentShot.result);
    const isTeeRehit = currentShot.result === "out-of-bounds";
    const nextClub = isTeeRehit ? currentShot.club : "7-iron" as ShotData["club"];
    setShots((prev) => [...prev, defaultShot(nextLie, nextClub)]);
  };

  // ── Putt handlers ──────────────────────────────────────────

  const handlePuttChange = (updated: PuttData) => {
    setPutts((prev) => {
      const next = [...prev];
      next[currentPuttIndex] = updated;
      return next;
    });
  };

  const handlePuttComplete = () => {
    const currentPutt = putts[currentPuttIndex];

    pushHistory();

    if (currentPutt.made) {
      // Hole complete
      const puttEntries = putts.map((p) => ({
        distance: p.distance,
        made: p.made,
        missDirection: p.missDirection,
        speed: p.speed,
        puttBreak: p.puttBreak,
        puttSlope: p.puttSlope,
        missX: p.missX,
        missY: p.missY,
      }));
      const hole = deriveHoleData(holeNumber, par, distance, shots, puttEntries, holeShape);
      setSummaryHole(hole);
      setPhase("summary");
      return;
    }

    // Missed — next putt
    setPutts((prev) => [...prev, defaultPutt()]);
  };

  // ── Summary / next hole ────────────────────────────────────

  const handleNextHole = () => {
    if (!summaryHole) return;

    const newCompleted = [...completedHoles, summaryHole];

    if (holeIndex === totalHoles - 1) {
      // All done
      onComplete(newCompleted);
      return;
    }

    // Advance to next hole
    setCompletedHoles(newCompleted);
    setHoleIndex((i) => i + 1);
    setPhase("shot");
    setShots([defaultShot("tee", "driver")]);
    setPutts([]);
    setHoleShape(undefined);
    setSummaryHole(null);
    setHistory([]);
  };

  // ── Progress calculation ───────────────────────────────────

  const progress = (holeIndex + (phase === "summary" ? 1 : 0.5)) / totalHoles;

  // Build subtitle
  let subtitle = "";
  if (phase === "shot") {
    const lieLabel = shots[currentShotIndex]?.lie.replace("-", " ") || "";
    subtitle = `Shot ${currentShotIndex + 1}${currentShotIndex > 0 ? ` · ${lieLabel}` : ""}`;
  } else if (phase === "putt") {
    subtitle = `Putt ${currentPuttIndex + 1}`;
  } else {
    subtitle = "Summary";
  }

  return (
    <div className="space-y-4">
      <ShotFlowHeader
        holeNumber={holeNumber}
        totalHoles={totalHoles}
        par={par}
        distance={distance}
        subtitle={subtitle}
        progress={progress}
      />

      <Card>
        <CardContent className="pt-4">
          {phase === "shot" && (
            <ShotStepCard
              shotNumber={currentShotIndex + 1}
              shot={shots[currentShotIndex]}
              par={par}
              isTeeShot={currentShotIndex === 0}
              holeShape={holeShape}
              onHoleShapeChange={setHoleShape}
              onChange={handleShotChange}
              onComplete={handleShotComplete}
              onBack={history.length > 0 ? goBack : undefined}
              isDetailed={isDetailed}
            />
          )}

          {phase === "putt" && (
            <PuttStepCard
              puttNumber={currentPuttIndex + 1}
              putt={putts[currentPuttIndex]}
              onChange={handlePuttChange}
              onComplete={handlePuttComplete}
              onBack={goBack}
              isDetailed={isDetailed}
            />
          )}

          {phase === "summary" && summaryHole && (
            <HoleSummaryCard
              hole={summaryHole}
              isLastHole={holeIndex === totalHoles - 1}
              onNext={handleNextHole}
              onBack={goBack}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
