"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HoleEntryCard } from "./hole-entry-card";
import { useRoundStore } from "@/stores/round-store";
import { HoleData, CourseInfo, Round, EntryMode } from "@/lib/types";
import { DEFAULT_HOLE_PARS } from "@/lib/constants";
import { EntryModeSelector } from "./entry-mode-selector";
import { ShotFlowWizard } from "./shot-flow-wizard";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";
import { cn, holeScoreColor } from "@/lib/utils";
import { ScoreIndicator } from "@/components/ui/score-indicator";

const SIMPLE_STEPS = ["Course Info", "Front 9", "Back 9", "Summary"];
const FLOW_STEPS = ["Course Info", "Shot Flow", "Summary"];

function createDefaultHoles(pars: number[], distances: number[]): HoleData[] {
  return pars.map((par, i) => ({
    holeNumber: i + 1,
    par,
    distance: distances[i] || 0,
    score: par,
    fairwayHit: par === 3 ? "na" : "yes",
    greenInRegulation: false,
    putts: 2,
    puttDistances: [20, 3],
    puttMisses: [{ missX: 0, missY: 0 }],
    penaltyStrokes: 0,
    upAndDownAttempt: false,
    upAndDownConverted: false,
    sandSaveAttempt: false,
    sandSaveConverted: false,
  }));
}

function HoleParDistanceRow({
  holeIndex,
  course,
  setCourse,
  holes,
  setHoles,
}: {
  holeIndex: number;
  course: CourseInfo;
  setCourse: (c: CourseInfo) => void;
  holes: HoleData[];
  setHoles: (h: HoleData[]) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-medium w-6 text-center shrink-0">
        {holeIndex + 1}
      </span>
      <select
        value={course.holePars[holeIndex]}
        onChange={(e) => {
          const pars = [...course.holePars];
          pars[holeIndex] = parseInt(e.target.value);
          setCourse({ ...course, holePars: pars });
          const updated = [...holes];
          updated[holeIndex] = {
            ...updated[holeIndex],
            par: pars[holeIndex],
            fairwayHit: pars[holeIndex] === 3 ? "na" : updated[holeIndex].fairwayHit,
          };
          setHoles(updated);
        }}
        className="border rounded text-center bg-background h-8 w-14 text-sm shrink-0"
      >
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5</option>
      </select>
      <Input
        type="number"
        value={course.holeDistances[holeIndex] || ""}
        onChange={(e) => {
          const dists = [...course.holeDistances];
          dists[holeIndex] = parseInt(e.target.value) || 0;
          setCourse({ ...course, holeDistances: dists });
          const updated = [...holes];
          updated[holeIndex] = { ...updated[holeIndex], distance: dists[holeIndex] };
          setHoles(updated);
        }}
        className="flex-1 h-8 text-sm"
        placeholder="Yards"
        min={0}
      />
    </div>
  );
}

export function RoundEntryWizard() {
  const router = useRouter();
  const addRound = useRoundStore((s) => s.addRound);
  const rounds = useRoundStore((s) => s.rounds);
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState("");
  const [entryMode, setEntryMode] = useState<EntryMode>("simple");

  const isSimple = entryMode === "simple";
  const STEPS = isSimple ? SIMPLE_STEPS : FLOW_STEPS;
  const summaryStep = STEPS.length - 1;
  const isShotFlowStep = !isSimple && step === 1;

  const [course, setCourse] = useState<CourseInfo>({
    name: "",
    tees: "",
    rating: 72.0,
    slope: 113,
    totalPar: 72,
    holePars: [...DEFAULT_HOLE_PARS],
    holeDistances: Array(18).fill(0),
  });

  const [holes, setHoles] = useState<HoleData[]>(
    createDefaultHoles(DEFAULT_HOLE_PARS, Array(18).fill(0))
  );

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Get unique course names for autocomplete
  const courseNames = [...new Set(rounds.map((r) => r.course.name))];

  const updateHole = (index: number, hole: HoleData) => {
    const updated = [...holes];
    updated[index] = hole;
    setHoles(updated);
  };

  const handleSave = () => {
    if (!course.name.trim()) {
      toast.error("Please enter a course name");
      setStep(0);
      return;
    }

    const totalScore = holes.reduce((sum, h) => sum + h.score, 0);
    const round: Round = {
      id: crypto.randomUUID(),
      date,
      course: { ...course, totalPar: course.holePars.reduce((a, b) => a + b, 0) },
      holes,
      totalScore,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entryMode,
    };

    addRound(round);
    toast.success("Round saved!");
    router.push("/");
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  // Build summary stats
  const tempRound: Round = {
    id: "temp",
    date,
    course: { ...course, totalPar: course.holePars.reduce((a, b) => a + b, 0) },
    holes,
    totalScore: holes.reduce((sum, h) => sum + h.score, 0),
    notes: "",
    createdAt: "",
    updatedAt: "",
  };
  const stats = calculateRoundStats(tempRound);

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={cn(
                "px-1 py-1 rounded transition-colors",
                i === step
                  ? "text-primary font-medium"
                  : "hover:text-foreground"
              )}
            >
              <span className="hidden sm:inline">{s}</span>
              <span className="sm:hidden">
                {i === 0 ? "Course" : i === 3 ? "Summary" : s}
              </span>
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Running total */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm bg-card rounded-lg px-3 py-2 border">
        <span>
          Score: <strong className="tabular-nums">{stats.totalScore}</strong>{" "}
          ({stats.scoreToPar === 0
            ? "E"
            : stats.scoreToPar > 0
              ? `+${stats.scoreToPar}`
              : stats.scoreToPar}
          )
        </span>
        <span className="text-xs sm:text-sm text-muted-foreground sm:text-foreground">
          FW: {stats.fairwayPercentage.toFixed(0)}% | GIR:{" "}
          {stats.girPercentage.toFixed(0)}% | Putts: {stats.totalPutts}
        </span>
      </div>

      {/* Step 0: Course Info */}
      {step === 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                value={course.name}
                onChange={(e) =>
                  setCourse({ ...course, name: e.target.value })
                }
                placeholder="e.g., Royal Wellington"
                list="course-names"
              />
              {courseNames.length > 0 && (
                <datalist id="course-names">
                  {courseNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Tees</Label>
                <Input
                  value={course.tees}
                  onChange={(e) =>
                    setCourse({ ...course, tees: e.target.value })
                  }
                  placeholder="Blue"
                />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Input
                  type="number"
                  value={course.rating}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      rating: parseFloat(e.target.value) || 72,
                    })
                  }
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Slope</Label>
                <Input
                  type="number"
                  value={course.slope}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      slope: parseInt(e.target.value) || 113,
                    })
                  }
                />
              </div>
            </div>

            {/* Entry Mode */}
            <EntryModeSelector value={entryMode} onChange={setEntryMode} />

            {/* Hole pars and distances - mobile-friendly list layout */}
            <div className="space-y-2">
              <Label>Hole Pars & Distances (optional)</Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {/* Front 9 */}
                <div>
                  <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground font-medium border-b">
                    <span className="w-6 text-center">Hole</span>
                    <span className="w-14 text-center">Par</span>
                    <span className="flex-1">Distance</span>
                  </div>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <HoleParDistanceRow
                      key={i}
                      holeIndex={i}
                      course={course}
                      setCourse={setCourse}
                      holes={holes}
                      setHoles={setHoles}
                    />
                  ))}
                </div>

                {/* Back 9 */}
                <div>
                  <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground font-medium border-b mt-3 sm:mt-0">
                    <span className="w-6 text-center">Hole</span>
                    <span className="w-14 text-center">Par</span>
                    <span className="flex-1">Distance</span>
                  </div>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <HoleParDistanceRow
                      key={i + 9}
                      holeIndex={i + 9}
                      course={course}
                      setCourse={setCourse}
                      holes={holes}
                      setHoles={setHoles}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Front 9 (Simple mode) */}
      {isSimple && step === 1 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Front 9</h2>
          {holes.slice(0, 9).map((hole, i) => (
            <HoleEntryCard
              key={i}
              hole={hole}
              onChange={(h) => updateHole(i, h)}
            />
          ))}
        </div>
      )}

      {/* Step 2: Back 9 (Simple mode) */}
      {isSimple && step === 2 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Back 9</h2>
          {holes.slice(9, 18).map((hole, i) => (
            <HoleEntryCard
              key={i + 9}
              hole={hole}
              onChange={(h) => updateHole(i + 9, h)}
            />
          ))}
        </div>
      )}

      {/* Step 1: Shot Flow (Standard/Detailed mode) */}
      {isShotFlowStep && (
        <ShotFlowWizard
          holePars={course.holePars}
          holeDistances={course.holeDistances}
          entryMode={entryMode}
          onComplete={(flowHoles) => {
            setHoles(flowHoles);
            setStep(summaryStep);
          }}
        />
      )}

      {/* Summary */}
      {step === summaryStep && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Round Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">{stats.totalScore}</p>
                  <p className="text-sm sm:text-lg text-muted-foreground">
                    {course.name} &middot;{" "}
                    {stats.scoreToPar === 0
                      ? "Even"
                      : stats.scoreToPar > 0
                        ? `+${stats.scoreToPar}`
                        : stats.scoreToPar}
                  </p>
                </div>

                {/* Scorecard */}
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-xs text-center" style={{ minWidth: "360px" }}>
                    <thead>
                      <tr className="border-b">
                        <th className="py-1.5 px-1 text-muted-foreground text-left">Hole</th>
                        {holes.slice(0, 9).map((_, i) => (
                          <th key={i} className="py-1.5 px-0.5 w-7">{i + 1}</th>
                        ))}
                        <th className="py-1.5 px-1 font-bold">Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b text-muted-foreground">
                        <td className="py-1.5 px-1 text-left">Par</td>
                        {holes.slice(0, 9).map((h, i) => (
                          <td key={i} className="py-1.5 px-0.5">{h.par}</td>
                        ))}
                        <td className="py-1.5 px-1 font-medium">
                          {holes.slice(0, 9).reduce((s, h) => s + h.par, 0)}
                        </td>
                      </tr>
                      <tr className="border-b font-medium">
                        <td className="py-1.5 px-1 text-left">Score</td>
                        {holes.slice(0, 9).map((h, i) => (
                          <td key={i} className="py-1.5 px-0.5">
                            <ScoreIndicator score={h.score} par={h.par} />
                          </td>
                        ))}
                        <td className="py-1.5 px-1 font-bold">
                          {holes.slice(0, 9).reduce((s, h) => s + h.score, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="w-full text-xs text-center mt-2" style={{ minWidth: "360px" }}>
                    <thead>
                      <tr className="border-b">
                        <th className="py-1.5 px-1 text-muted-foreground text-left">Hole</th>
                        {holes.slice(9, 18).map((_, i) => (
                          <th key={i} className="py-1.5 px-0.5 w-7">{i + 10}</th>
                        ))}
                        <th className="py-1.5 px-1 font-bold">In</th>
                        <th className="py-1.5 px-1 font-bold">Tot</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b text-muted-foreground">
                        <td className="py-1.5 px-1 text-left">Par</td>
                        {holes.slice(9, 18).map((h, i) => (
                          <td key={i} className="py-1.5 px-0.5">{h.par}</td>
                        ))}
                        <td className="py-1.5 px-1 font-medium">
                          {holes.slice(9, 18).reduce((s, h) => s + h.par, 0)}
                        </td>
                        <td className="py-1.5 px-1 font-medium">
                          {holes.reduce((s, h) => s + h.par, 0)}
                        </td>
                      </tr>
                      <tr className="border-b font-medium">
                        <td className="py-1.5 px-1 text-left">Score</td>
                        {holes.slice(9, 18).map((h, i) => (
                          <td key={i} className="py-1.5 px-0.5">
                            <ScoreIndicator score={h.score} par={h.par} />
                          </td>
                        ))}
                        <td className="py-1.5 px-1 font-bold">
                          {holes.slice(9, 18).reduce((s, h) => s + h.score, 0)}
                        </td>
                        <td className="py-1.5 px-1 font-bold">
                          {stats.totalScore}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fairways</span>
                    <span className="font-medium tabular-nums">
                      {stats.fairwaysHit}/{stats.fairwaysAttempted} (
                      {stats.fairwayPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GIR</span>
                    <span className="font-medium tabular-nums">
                      {stats.greensInRegulation}/18 (
                      {stats.girPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Putts</span>
                    <span className="font-medium tabular-nums">{stats.totalPutts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Putts/GIR</span>
                    <span className="font-medium tabular-nums">
                      {stats.puttsPerGir.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Up & Down</span>
                    <span className="font-medium tabular-nums">
                      {stats.upAndDownConversions}/{stats.upAndDownAttempts}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Penalties</span>
                    <span className="font-medium tabular-nums">{stats.penalties}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did you play? Anything to remember?"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation buttons - hidden during shot flow (it has its own nav) */}
      {!isShotFlowStep && (
        <div className="flex justify-between pt-2 pb-2 sticky bottom-16 md:bottom-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="h-11 px-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < summaryStep ? (
            <Button onClick={() => setStep(step + 1)} className="h-11 px-6">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="h-11 px-6">
              <Save className="mr-2 h-4 w-4" />
              Save Round
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
