"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "./confirm-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Round } from "@/lib/types";

interface AdminRound extends Round {
  userId: string;
  userName: string;
  userEmail: string;
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
  const [filterUser, setFilterUser] = useState("all");
  const [deleteRound, setDeleteRound] = useState<AdminRound | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered =
    filterUser === "all"
      ? rounds
      : rounds.filter((r) => r.userId === filterUser);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-white/60">
          {filtered.length} round{filtered.length === 1 ? "" : "s"}
          {filterUser !== "all" && ` for ${users.find((u) => u.id === filterUser)?.name}`}
        </p>
        <Select value={filterUser} onValueChange={(v) => v && setFilterUser(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-center text-white/60 py-8">No rounds found.</p>
        ) : (
          sorted.map((round) => {
            const diff = round.totalScore - round.course.totalPar;
            const diffStr =
              diff === 0 ? "E" : diff > 0 ? `+${diff}` : `${diff}`;
            return (
              <Card
                key={round.id}
                className="hover:bg-accent/5 transition-colors"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <Link
                    href={`/admin/rounds/${round.id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">
                        {round.userName}
                      </span>
                      <span className="text-white/60 text-xs">·</span>
                      <span className="text-sm">{round.course.name}</span>
                      <span className="text-white/60 text-xs">
                        ({round.course.tees})
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-0.5">
                      {format(new Date(round.date), "MMM d, yyyy")}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold">{round.totalScore}</p>
                      <p
                        className={`text-xs font-medium ${
                          diff < 0
                            ? "text-primary"
                            : diff === 0
                              ? "text-white/60"
                              : "text-red-500"
                        }`}
                      >
                        {diffStr}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/40 hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteRound(round);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

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
