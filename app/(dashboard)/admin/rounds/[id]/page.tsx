"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Save, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import { calculateRoundStrokesGained } from "@/lib/stats/strokes-gained";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { format } from "date-fns";
import { cn, roundBadgeColor } from "@/lib/utils";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import { toast } from "sonner";
import type { Round, HoleData } from "@/lib/types";

interface AdminRound extends Round {
  userId: string;
  userName: string;
  userEmail: string;
}

export default function AdminRoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [round, setRound] = useState<AdminRound | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editHoles, setEditHoles] = useState<HoleData[]>([]);
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/rounds/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load round");
        return res.json();
      })
      .then((data) => setRound(data.round))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const startEditing = () => {
    if (!round) return;
    setEditHoles(round.holes.map((h) => ({ ...h })));
    setEditNotes(round.notes || "");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditHoles([]);
    setEditNotes("");
  };

  const updateHoleScore = (index: number, value: string) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 15) return;
    setEditHoles((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], score: num };
      return next;
    });
  };

  const updateHolePutts = (index: number, value: string) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 10) return;
    setEditHoles((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], putts: num };
      return next;
    });
  };

  const handleSave = async () => {
    if (!round) return;
    setSaving(true);
    try {
      const totalScore = editHoles.reduce((sum, h) => sum + h.score, 0);
      const updatedRound: Round = {
        ...round,
        holes: editHoles,
        totalScore,
        notes: editNotes,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/admin/rounds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRound),
      });

      if (!res.ok) {
        toast.error("Failed to save changes");
        return;
      }

      // Update local state
      setRound({
        ...round,
        holes: editHoles,
        totalScore,
        notes: editNotes,
      });
      setEditing(false);
      toast.success("Round updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/rounds/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete round");
        return;
      }
      toast.success("Round deleted");
      router.push("/admin");
    } catch {
      toast.error("Failed to delete round");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  if (error || !round) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg font-medium">
          {error ?? "Round not found"}
        </p>
        <Link
          href="/admin"
          className={buttonVariants({ variant: "outline" }) + " mt-4"}
        >
          Back to Admin
        </Link>
      </div>
    );
  }

  const displayHoles = editing ? editHoles : round.holes;
  const displayTotalScore = editing
    ? editHoles.reduce((s, h) => s + h.score, 0)
    : round.totalScore;
  const displayNotes = editing ? editNotes : round.notes;

  const stats = calculateRoundStats({
    ...round,
    holes: displayHoles,
    totalScore: displayTotalScore,
  });
  const sg = calculateRoundStrokesGained({
    ...round,
    holes: displayHoles,
    totalScore: displayTotalScore,
  });

  const renderScorecardHalf = (holes: HoleData[], startIndex: number) => (
    <table
      className="w-full text-xs text-center tabular-nums"
      style={{ minWidth: startIndex === 0 ? "340px" : "380px" }}
    >
      <thead>
        <tr className="border-b">
          <th className="py-1.5 px-1 text-left text-white/60">Hole</th>
          {holes.map((_, i) => (
            <th key={i} className="py-1.5 px-0.5 w-7">
              {startIndex + i + 1}
            </th>
          ))}
          <th className="py-1.5 px-1 font-bold">
            {startIndex === 0 ? "Out" : "In"}
          </th>
          {startIndex === 9 && (
            <th className="py-1.5 px-1 font-bold">Tot</th>
          )}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b text-white/60">
          <td className="py-1.5 px-1 text-left">Par</td>
          {holes.map((h, i) => (
            <td key={i} className="py-1.5 px-0.5">
              {h.par}
            </td>
          ))}
          <td className="py-1.5 px-1 font-medium">
            {holes.reduce((s, h) => s + h.par, 0)}
          </td>
          {startIndex === 9 && (
            <td className="py-1.5 px-1 font-medium">
              {displayHoles.reduce((s, h) => s + h.par, 0)}
            </td>
          )}
        </tr>
        <tr className="border-b font-medium">
          <td className="py-1.5 px-1 text-left">Score</td>
          {holes.map((h, i) => (
            <td key={i} className="py-1.5 px-0.5">
              {editing ? (
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={h.score}
                  onChange={(e) =>
                    updateHoleScore(startIndex + i, e.target.value)
                  }
                  className="h-6 w-8 p-0 text-center text-xs mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              ) : (
                <ScoreIndicator score={h.score} par={h.par} />
              )}
            </td>
          ))}
          <td className="py-1.5 px-1 font-bold">
            {holes.reduce((s, h) => s + h.score, 0)}
          </td>
          {startIndex === 9 && (
            <td className="py-1.5 px-1 font-bold">{displayTotalScore}</td>
          )}
        </tr>
        <tr className="border-b text-white/60">
          <td className="py-1.5 px-1 text-left">Putts</td>
          {holes.map((h, i) => (
            <td key={i} className="py-1.5 px-0.5">
              {editing ? (
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={h.putts}
                  onChange={(e) =>
                    updateHolePutts(startIndex + i, e.target.value)
                  }
                  className="h-6 w-8 p-0 text-center text-xs mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              ) : (
                h.putts
              )}
            </td>
          ))}
          <td className="py-1.5 px-1 font-medium">
            {holes.reduce((s, h) => s + h.putts, 0)}
          </td>
          {startIndex === 9 && (
            <td className="py-1.5 px-1 font-medium">
              {displayHoles.reduce((s, h) => s + h.putts, 0)}
            </td>
          )}
        </tr>
      </tbody>
    </table>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/admin"
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Link>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEditing}
                disabled={saving}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <PageHeader
        title={round.course.name}
        description={`${round.userName} | ${format(new Date(round.date), "MMM d, yyyy")} ${round.course.tees ? `| ${round.course.tees} tees` : ""}`}
      />

      <div className="space-y-4">
        {/* Score header */}
        <Card>
          <CardContent className="py-4 sm:py-6 text-center">
            <p className="text-4xl sm:text-5xl font-bold">
              {displayTotalScore}
            </p>
            <Badge
              className={cn(
                "mt-2 text-sm",
                roundBadgeColor(
                  displayTotalScore - round.course.totalPar
                )
              )}
            >
              {displayTotalScore - round.course.totalPar === 0
                ? "Even Par"
                : displayTotalScore - round.course.totalPar > 0
                  ? `+${displayTotalScore - round.course.totalPar}`
                  : displayTotalScore - round.course.totalPar}
            </Badge>
          </CardContent>
        </Card>

        {/* Scorecard */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Scorecard
              {editing && (
                <span className="text-xs text-primary ml-2 font-normal">
                  (editing)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-6">
            {renderScorecardHalf(displayHoles.slice(0, 9), 0)}
            <div className="mt-3">
              {renderScorecardHalf(displayHoles.slice(9, 18), 9)}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm text-white/60">
                Fairways
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold">
                {stats.fairwaysHit}/{stats.fairwaysAttempted}
              </p>
              <p className="text-xs sm:text-sm text-white/60">
                {stats.fairwayPercentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm text-white/60">
                Greens in Reg
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold">
                {stats.greensInRegulation}/18
              </p>
              <p className="text-xs sm:text-sm text-white/60">
                {stats.girPercentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm text-white/60">
                Total Putts
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold">
                {stats.totalPutts}
              </p>
              <p className="text-xs sm:text-sm text-white/60">
                {stats.puttsPerGir.toFixed(2)} per GIR
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm text-white/60">
                Scrambling
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold">
                {stats.scramblingPercentage.toFixed(0)}%
              </p>
              <p className="text-xs sm:text-sm text-white/60">
                {stats.upAndDownConversions}/{stats.upAndDownAttempts} up &
                down
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Strokes Gained */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Strokes Gained vs PGA Tour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "Off the Tee", value: sg.sgOffTheTee },
              { label: "Approach", value: sg.sgApproach },
              { label: "Around the Green", value: sg.sgAroundTheGreen },
              { label: "Putting", value: sg.sgPutting },
              { label: "Total", value: sg.sgTotal },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-0.5"
              >
                <span className="text-sm">{item.label}</span>
                <span
                  className={cn(
                    "font-bold tabular-nums",
                    item.value >= 0 ? "text-primary" : "text-red-500"
                  )}
                >
                  {item.value > 0 ? "+" : ""}
                  {item.value.toFixed(2)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Add notes about this round..."
              />
            ) : displayNotes ? (
              <p className="text-sm text-white/60 whitespace-pre-wrap">
                {displayNotes}
              </p>
            ) : (
              <p className="text-sm text-white/40 italic">No notes</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Round?"
        description={`Delete ${round.userName}'s round at ${round.course.name} (${round.totalScore})? This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
