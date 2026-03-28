"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { format } from "date-fns";
import type { Round } from "@/lib/types";

interface AdminRound extends Round {
  userId: string;
  userName: string;
  userEmail: string;
}

interface AdminData {
  rounds: AdminRound[];
  users: { id: string; name: string; email: string }[];
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/rounds")
      .then((res) => {
        if (res.status === 403) throw new Error("You don't have admin access");
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-muted rounded w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg font-medium">{error}</p>
        <p className="text-white/70 mt-2">
          Admin access is required to view this page.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const filtered =
    filterUser === "all"
      ? data.rounds
      : data.rounds.filter((r) => r.userId === filterUser);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group by user for summary
  const userStats = data.users.map((user) => {
    const userRounds = data.rounds.filter((r) => r.userId === user.id);
    const avgScore =
      userRounds.length > 0
        ? Math.round(
            userRounds.reduce((sum, r) => sum + r.totalScore, 0) /
              userRounds.length
          )
        : 0;
    return { ...user, roundCount: userRounds.length, avgScore };
  });

  return (
    <>
      <PageHeader
        title="Admin — All Users"
        description={`${data.users.length} user${data.users.length === 1 ? "" : "s"}, ${data.rounds.length} total round${data.rounds.length === 1 ? "" : "s"}`}
      />

      {/* User summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {userStats.map((u) => (
          <Card
            key={u.id}
            className={`cursor-pointer transition-colors ${filterUser === u.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilterUser(filterUser === u.id ? "all" : u.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant="secondary">
                  {u.roundCount} round{u.roundCount === 1 ? "" : "s"}
                </Badge>
              </div>
              {u.avgScore > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Avg score: {u.avgScore}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter indicator */}
      {filterUser !== "all" && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">
            Showing rounds for:{" "}
            <strong>
              {data.users.find((u) => u.id === filterUser)?.name}
            </strong>
          </span>
          <button
            onClick={() => setFilterUser("all")}
            className="text-xs text-primary hover:underline"
          >
            Show all
          </button>
        </div>
      )}

      {/* Rounds list */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No rounds recorded yet.
          </p>
        ) : (
          sorted.map((round) => {
            const diff = round.totalScore - round.course.totalPar;
            const diffStr =
              diff === 0 ? "E" : diff > 0 ? `+${diff}` : `${diff}`;
            return (
              <Link key={round.id} href={`/admin/rounds/${round.id}`}>
                <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {round.userName}
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-sm">{round.course.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({round.course.tees})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(round.date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-lg font-bold">{round.totalScore}</p>
                      <p
                        className={`text-xs font-medium ${
                          diff < 0
                            ? "text-primary"
                            : diff === 0
                              ? "text-muted-foreground"
                              : "text-red-500"
                        }`}
                      >
                        {diffStr}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
