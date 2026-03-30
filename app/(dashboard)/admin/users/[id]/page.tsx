"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { type ColumnDef, DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ArrowLeft, LogIn, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { calculateRoundStats, calculateAggregateStats } from "@/lib/stats/calculate-stats";
import { STAT_LABELS } from "@/lib/constants";
import type { Round, Goal } from "@/lib/types";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState(false);
  const [deleteRound, setDeleteRound] = useState<Round | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (res.status === 403) throw new Error("Forbidden");
        if (res.status === 404) throw new Error("User not found");
        if (!res.ok) throw new Error("Failed to load");

        const data = await res.json();
        setUser(data.user);
        setRounds(data.rounds);
        setGoals(data.goals);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const aggregateStats = useMemo(
    () => (rounds.length > 0 ? calculateAggregateStats(rounds) : null),
    [rounds]
  );

  const bestScore = useMemo(
    () =>
      rounds.length > 0
        ? Math.min(...rounds.map((r) => r.totalScore))
        : null,
    [rounds]
  );

  const roundColumns: ColumnDef<Round, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "course.name",
        header: "Course",
        accessorFn: (row) => row.course.name,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.course.name}</span>
        ),
      },
      {
        accessorKey: "course.tees",
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
        cell: ({ row }) => {
          const diff = row.original.totalScore - row.original.course.totalPar;
          const diffStr = diff === 0 ? "E" : diff > 0 ? `+${diff}` : `${diff}`;
          return (
            <div className="tabular-nums">
              <span className="font-bold">{row.original.totalScore}</span>
              <span
                className={`ml-1.5 text-xs ${
                  diff < 0
                    ? "text-primary"
                    : diff === 0
                      ? "text-muted-foreground"
                      : "text-red-500"
                }`}
              >
                ({diffStr})
              </span>
            </div>
          );
        },
      },
      {
        id: "putts",
        header: "Putts",
        accessorFn: (row) => {
          const stats = calculateRoundStats(row);
          return stats.totalPutts;
        },
        cell: ({ getValue }) => (
          <span className="tabular-nums">{getValue() as number}</span>
        ),
      },
      {
        id: "fairways",
        header: "FW%",
        accessorFn: (row) => {
          const stats = calculateRoundStats(row);
          return stats.fairwayPercentage;
        },
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as number).toFixed(0)}%
          </span>
        ),
      },
      {
        id: "gir",
        header: "GIR%",
        accessorFn: (row) => {
          const stats = calculateRoundStats(row);
          return stats.girPercentage;
        },
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as number).toFixed(0)}%
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
            className="h-7 w-7 text-white/40 hover:text-destructive"
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

  const goalColumns: ColumnDef<Goal, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "statCategory",
        header: "Category",
        cell: ({ row }) => (
          <span className="font-medium">
            {STAT_LABELS[row.original.statCategory] ?? row.original.statCategory}
          </span>
        ),
      },
      {
        accessorKey: "targetValue",
        header: "Target",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.targetValue}</span>
        ),
      },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize">
            {row.original.direction}
          </Badge>
        ),
      },
      {
        accessorKey: "targetDate",
        header: "Deadline",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {format(new Date(row.original.targetDate), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => (row.isCompleted ? "Completed" : "Active"),
        cell: ({ row }) => (
          <Badge variant={row.original.isCompleted ? "default" : "secondary"}>
            {row.original.isCompleted ? "Completed" : "Active"}
          </Badge>
        ),
      },
    ],
    []
  );

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to impersonate");
        return;
      }

      await refreshUser();
      toast.success(`Now viewing as ${user?.name}`);
      router.push("/");
    } catch {
      toast.error("Failed to impersonate");
    } finally {
      setImpersonating(false);
    }
  };

  const handleDeleteRound = async () => {
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
      setRounds((prev) => prev.filter((r) => r.id !== deleteRound.id));
    } catch {
      toast.error("Failed to delete round");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg font-medium">
          {error || "User not found"}
        </p>
        <Link
          href="/admin"
          className="text-primary hover:underline text-sm mt-2 inline-block"
        >
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Admin
          </Link>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            {user.email} · Joined{" "}
            {format(new Date(user.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <Button
          onClick={handleImpersonate}
          disabled={impersonating}
          className="shrink-0"
        >
          <LogIn className="h-4 w-4 mr-2" />
          {impersonating ? "Switching..." : "Log in as User"}
        </Button>
      </div>

      {/* Summary Stats */}
      {aggregateStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {aggregateStats.roundCount}
              </p>
              <p className="text-xs text-muted-foreground">Rounds</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {aggregateStats.scoringAverage.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Scoring Avg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {aggregateStats.puttsPerRound.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Putts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {bestScore ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Best Round</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rounds & Goals Tabs */}
      <Tabs defaultValue="rounds">
        <TabsList>
          <TabsTrigger value="rounds">
            Rounds ({rounds.length})
          </TabsTrigger>
          <TabsTrigger value="goals">
            Goals ({goals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rounds" className="mt-4">
          <DataTable
            columns={roundColumns}
            data={[...rounds].sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )}
            onRowClick={(round) => router.push(`/admin/rounds/${round.id}`)}
            emptyMessage="No rounds found."
          />
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <DataTable
            columns={goalColumns}
            data={goals}
            emptyMessage="No goals found."
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteRound}
        onOpenChange={(open) => !open && setDeleteRound(null)}
        title="Delete Round?"
        description={`Delete round at ${deleteRound?.course.name} (${deleteRound?.totalScore})? This cannot be undone.`}
        onConfirm={handleDeleteRound}
        loading={deleting}
      />
    </div>
  );
}
