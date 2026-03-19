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
import { HoleData, CourseInfo, Round } from "@/lib/types";
import { DEFAULT_HOLE_PARS } from "@/lib/constants";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Course Info", "Front 9", "Back 9", "Summary"];

function createDefaultHoles(pars: number[], distances: number[]): HoleData[] {
  return pars.map((par, i) => ({
    holeNumber: i + 1,
    par,
    distance: distances[i] || 0,
    score: par,
    fairwayHit: par === 3 ? "na" : "yes",
    greenInRegulation: false,
    putts: 2,
    firstPuttDistance: 20,
    penaltyStrokes: 0,
    upAndDownAttempt: false,
    upAndDownConverted: false,
    sandSaveAttempt: false,
    sandSaveConverted: false,
  }));
}

export function RoundEntryWizard() {
  const router = useRouter();
  const addRound = useRoundStore((s) => s.addRound);
  const rounds = useRoundStore((s) => s.rounds);
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState("");

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
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`${i === step ? "text-primary font-medium" : ""} hover:text-foreground transition-colors`}
            >
              {s}
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Running total */}
      <div className="flex items-center justify-between text-sm bg-card rounded-lg px-4 py-2 border">
        <span>
          Score: <strong className="tabular-nums">{stats.totalScore}</strong>{" "}
          ({stats.scoreToPar === 0
            ? "E"
            : stats.scoreToPar > 0
              ? `+${stats.scoreToPar}`
              : stats.scoreToPar}
          )
        </span>
        <span>
          FW: {stats.fairwayPercentage.toFixed(0)}% | GIR:{" "}
          {stats.girPercentage.toFixed(0)}% | Putts: {stats.totalPutts}
        </span>
      </div>

      {/* Step 0: Course Info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                value={course.name}
                onChange={(e) =>
                  setCourse({ ...course, name: e.target.value })
                }
                placeholder="e.g., Pebble Beach"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tees</Label>
                <Input
                  value={course.tees}
                  onChange={(e) =>
                    setCourse({ ...course, tees: e.target.value })
                  }
                  placeholder="e.g., Blue"
                />
              </div>
              <div className="space-y-2">
                <Label>Course Rating</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            {/* Hole pars and distances */}
            <div className="space-y-2">
              <Label>Hole Pars & Distances (optional)</Label>
              <div className="grid grid-cols-9 gap-1 text-center text-xs">
                {holes.slice(0, 9).map((h, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-muted-foreground font-medium">
                      {i + 1}
                    </div>
                    <select
                      value={course.holePars[i]}
                      onChange={(e) => {
                        const pars = [...course.holePars];
                        pars[i] = parseInt(e.target.value);
                        setCourse({ ...course, holePars: pars });
                        const updated = [...holes];
                        updated[i] = {
                          ...updated[i],
                          par: pars[i],
                          fairwayHit: pars[i] === 3 ? "na" : updated[i].fairwayHit,
                        };
                        setHoles(updated);
                      }}
                      className="w-full border rounded text-center bg-background h-7"
                    >
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                    <Input
                      type="number"
                      value={course.holeDistances[i] || ""}
                      onChange={(e) => {
                        const dists = [...course.holeDistances];
                        dists[i] = parseInt(e.target.value) || 0;
                        setCourse({ ...course, holeDistances: dists });
                        const updated = [...holes];
                        updated[i] = { ...updated[i], distance: dists[i] };
                        setHoles(updated);
                      }}
                      className="w-full h-7 text-xs px-1"
                      placeholder="yds"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-9 gap-1 text-center text-xs mt-2">
                {holes.slice(9, 18).map((h, i) => (
                  <div key={i + 9} className="space-y-1">
                    <div className="text-muted-foreground font-medium">
                      {i + 10}
                    </div>
                    <select
                      value={course.holePars[i + 9]}
                      onChange={(e) => {
                        const pars = [...course.holePars];
                        pars[i + 9] = parseInt(e.target.value);
                        setCourse({ ...course, holePars: pars });
                        const updated = [...holes];
                        updated[i + 9] = {
                          ...updated[i + 9],
                          par: pars[i + 9],
                          fairwayHit: pars[i + 9] === 3 ? "na" : updated[i + 9].fairwayHit,
                        };
                        setHoles(updated);
                      }}
                      className="w-full border rounded text-center bg-background h-7"
                    >
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                    <Input
                      type="number"
                      value={course.holeDistances[i + 9] || ""}
                      onChange={(e) => {
                        const dists = [...course.holeDistances];
                        dists[i + 9] = parseInt(e.target.value) || 0;
                        setCourse({ ...course, holeDistances: dists });
                        const updated = [...holes];
                        updated[i + 9] = { ...updated[i + 9], distance: dists[i + 9] };
                        setHoles(updated);
                      }}
                      className="w-full h-7 text-xs px-1"
                      placeholder="yds"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Front 9 */}
      {step === 1 && (
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

      {/* Step 2: Back 9 */}
      {step === 2 && (
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

      {/* Step 3: Summary */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Round Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">{stats.totalScore}</p>
                  <p className="text-lg text-muted-foreground">
                    {course.name} &middot;{" "}
                    {stats.scoreToPar === 0
                      ? "Even"
                      : stats.scoreToPar > 0
                        ? `+${stats.scoreToPar}`
                        : stats.scoreToPar}
                  </p>
                </div>

                {/* Scorecard */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center">
                    <thead>
                      <tr className="border-b">
                        <th className="py-1 px-1 text-muted-foreground">Hole</th>
                        {holes.slice(0, 9).map((_, i) => (
                          <th key={i} className="py-1 px-1">{i + 1}</th>
                        ))}
                        <th className="py-1 px-1 font-bold">Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b text-muted-foreground">
                        <td className="py-1 px-1">Par</td>
                        {holes.slice(0, 9).map((h, i) => (
                          <td key={i} className="py-1 px-1">{h.par}</td>
                        ))}
                        <td className="py-1 px-1 font-medium">
                          {holes.slice(0, 9).reduce((s, h) => s + h.par, 0)}
                        </td>
                      </tr>
                      <tr className="border-b font-medium">
                        <td className="py-1 px-1">Score</td>
                        {holes.slice(0, 9).map((h, i) => (
                          <td
                            key={i}
                            className={`py-1 px-1 ${
                              h.score < h.par
                                ? "text-green-600"
                                : h.score > h.par
                                  ? "text-red-500"
                                  : ""
                            }`}
                          >
                            {h.score}
                          </td>
                        ))}
                        <td className="py-1 px-1 font-bold">
                          {holes.slice(0, 9).reduce((s, h) => s + h.score, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="w-full text-xs text-center mt-2">
                    <thead>
                      <tr className="border-b">
                        <th className="py-1 px-1 text-muted-foreground">Hole</th>
                        {holes.slice(9, 18).map((_, i) => (
                          <th key={i} className="py-1 px-1">{i + 10}</th>
                        ))}
                        <th className="py-1 px-1 font-bold">In</th>
                        <th className="py-1 px-1 font-bold">Tot</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b text-muted-foreground">
                        <td className="py-1 px-1">Par</td>
                        {holes.slice(9, 18).map((h, i) => (
                          <td key={i} className="py-1 px-1">{h.par}</td>
                        ))}
                        <td className="py-1 px-1 font-medium">
                          {holes.slice(9, 18).reduce((s, h) => s + h.par, 0)}
                        </td>
                        <td className="py-1 px-1 font-medium">
                          {holes.reduce((s, h) => s + h.par, 0)}
                        </td>
                      </tr>
                      <tr className="border-b font-medium">
                        <td className="py-1 px-1">Score</td>
                        {holes.slice(9, 18).map((h, i) => (
                          <td
                            key={i}
                            className={`py-1 px-1 ${
                              h.score < h.par
                                ? "text-green-600"
                                : h.score > h.par
                                  ? "text-red-500"
                                  : ""
                            }`}
                          >
                            {h.score}
                          </td>
                        ))}
                        <td className="py-1 px-1 font-bold">
                          {holes.slice(9, 18).reduce((s, h) => s + h.score, 0)}
                        </td>
                        <td className="py-1 px-1 font-bold">
                          {stats.totalScore}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fairways</span>
                    <span className="font-medium">
                      {stats.fairwaysHit}/{stats.fairwaysAttempted} (
                      {stats.fairwayPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GIR</span>
                    <span className="font-medium">
                      {stats.greensInRegulation}/18 (
                      {stats.girPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Putts</span>
                    <span className="font-medium">{stats.totalPutts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Putts/GIR</span>
                    <span className="font-medium">
                      {stats.puttsPerGir.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Up & Down</span>
                    <span className="font-medium">
                      {stats.upAndDownConversions}/{stats.upAndDownAttempts}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Penalties</span>
                    <span className="font-medium">{stats.penalties}</span>
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

      {/* Navigation buttons */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Round
          </Button>
        )}
      </div>
    </div>
  );
}
