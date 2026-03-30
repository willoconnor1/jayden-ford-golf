"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef, DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, X } from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import type { Round } from "@/lib/types";

interface AdminRound extends Round {
  userId: string;
  userName: string;
  userEmail: string;
}

interface RoundRow extends AdminRound {
  scoreToPar: number;
  totalPutts: number;
  fairwayPct: number;
  girPct: number;
}

interface AdminRoundsTabProps {
  rounds: AdminRound[];
  users: { id: string; name: string; email: string }[];
  refresh: () => void;
}

export function AdminRoundsTab({
  rounds,
  users,
  refresh,
}: AdminRoundsTabProps) {
  const router = useRouter();
  const [filterUser, setFilterUser] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteRound, setDeleteRound] = useState<AdminRound | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pre-compute stats for each round
  const enrichedRounds: RoundRow[] = useMemo(
    () =>
      rounds.map((round) => {
        const stats = calculateRoundStats(round);
        return {
          ...round,
          scoreToPar: round.totalScore - round.course.totalPar,
          totalPutts: stats.totalPutts,
          fairwayPct: stats.fairwayPercentage,
          girPct: stats.girPercentage,
        };
      }),
    [rounds]
  );

  // Unique course names for filter
  const courseNames = useMemo(() => {
    const names = new Set(rounds.map((r) => r.course.name));
    return [...names].sort();
  }, [rounds]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = enrichedRounds;

    if (filterUser !== "all") {
      result = result.filter((r) => r.userId === filterUser);
    }
    if (filterCourse !== "all") {
      result = result.filter((r) => r.course.name === filterCourse);
    }
    if (scoreMin) {
      const min = parseInt(scoreMin);
      if (!isNaN(min)) result = result.filter((r) => r.totalScore >= min);
    }
    if (scoreMax) {
      const max = parseInt(scoreMax);
      if (!isNaN(max)) result = result.filter((r) => r.totalScore <= max);
    }
    if (dateFrom) {
      result = result.filter((r) => r.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((r) => r.date <= dateTo + "T23:59:59");
    }

    return result;
  }, [enrichedRounds, filterUser, filterCourse, scoreMin, scoreMax, dateFrom, dateTo]);

  const hasFilters =
    filterUser !== "all" ||
    filterCourse !== "all" ||
    scoreMin ||
    scoreMax ||
    dateFrom ||
    dateTo;

  const clearFilters = () => {
    setFilterUser("all");
    setFilterCourse("all");
    setScoreMin("");
    setScoreMax("");
    setDateFrom("");
    setDateTo("");
  };

  const columns: ColumnDef<RoundRow, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "userName",
        header: "Player",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.userName}</span>
        ),
      },
      {
        id: "courseName",
        header: "Course",
        accessorFn: (row) => row.course.name,
        cell: ({ row }) => (
          <span>{row.original.course.name}</span>
        ),
      },
      {
        id: "tees",
        header: "Tees",
        accessorFn: (row) => row.course.tees,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.course.tees}</span>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {format(new Date(row.original.date), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        accessorKey: "totalScore",
        header: "Score",
        cell: ({ row }) => (
          <span className="font-bold tabular-nums">
            {row.original.totalScore}
          </span>
        ),
      },
      {
        accessorKey: "scoreToPar",
        header: "+/-",
        cell: ({ row }) => {
          const diff = row.original.scoreToPar;
          const str = diff === 0 ? "E" : diff > 0 ? `+${diff}` : `${diff}`;
          return (
            <span
              className={`font-medium tabular-nums ${
                diff < 0
                  ? "text-primary"
                  : diff === 0
                    ? "text-muted-foreground"
                    : "text-red-500"
              }`}
            >
              {str}
            </span>
          );
        },
      },
      {
        accessorKey: "totalPutts",
        header: "Putts",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.totalPutts}</span>
        ),
      },
      {
        accessorKey: "fairwayPct",
        header: "FW%",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.fairwayPct.toFixed(0)}%
          </span>
        ),
      },
      {
        accessorKey: "girPct",
        header: "GIR%",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.girPct.toFixed(0)}%
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteRound(row.original);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    []
  );

  const handleDelete = async () => {
    if (!deleteRound) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/rounds/${deleteRound.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete round");
        return;
      }
      toast.success("Round deleted");
      setDeleteRound(null);
      refresh();
    } catch {
      toast.error("Failed to delete round");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={[...filtered].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )}
        onRowClick={(round) => router.push(`/admin/rounds/${round.id}`)}
        emptyMessage="No rounds found."
        toolbar={
          <div className="flex flex-wrap items-end gap-2 w-full">
            {/* Player filter */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Player
              </label>
              <Select value={filterUser} onValueChange={(v) => v && setFilterUser(v)}>
                <SelectTrigger className="h-8 w-[160px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Players</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course filter */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Course
              </label>
              <Select value={filterCourse} onValueChange={(v) => v && setFilterCourse(v)}>
                <SelectTrigger className="h-8 w-[180px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courseNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Score range */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Score Range
              </label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={scoreMin}
                  onChange={(e) => setScoreMin(e.target.value)}
                  className="h-8 w-[70px] text-sm tabular-nums"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={scoreMax}
                  onChange={(e) => setScoreMax(e.target.value)}
                  className="h-8 w-[70px] text-sm tabular-nums"
                />
              </div>
            </div>

            {/* Date range */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Date Range
              </label>
              <div className="flex items-center gap-1">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 w-[130px] text-sm"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 w-[130px] text-sm"
                />
              </div>
            </div>

            {/* Results count + clear */}
            <div className="flex items-center gap-2 ml-auto self-end">
              <span className="text-xs text-muted-foreground">
                {filtered.length} round{filtered.length === 1 ? "" : "s"}
              </span>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={clearFilters}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        }
      />

      <ConfirmDialog
        open={!!deleteRound}
        onOpenChange={(open) => !open && setDeleteRound(null)}
        title="Delete Round?"
        description={`Delete ${deleteRound?.userName}'s round at ${deleteRound?.course.name} (${deleteRound?.totalScore})? This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
