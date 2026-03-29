"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { STAT_LABELS, formatStat } from "@/lib/constants";
import type { Goal, StatCategory } from "@/lib/types";

interface AdminGoal extends Goal {
  userId: string;
  userName: string;
  userEmail: string;
}

interface AdminGoalsTabProps {
  goals: AdminGoal[];
  users: { id: string; name: string; email: string }[];
  refresh: () => void;
}

export function AdminGoalsTab({ goals, users, refresh }: AdminGoalsTabProps) {
  const [filterUser, setFilterUser] = useState("all");
  const [deleteGoal, setDeleteGoal] = useState<AdminGoal | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered =
    filterUser === "all"
      ? goals
      : goals.filter((g) => g.userId === filterUser);

  const handleDelete = async () => {
    if (!deleteGoal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/goals/${deleteGoal.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete goal");
        return;
      }
      toast.success("Goal deleted");
      setDeleteGoal(null);
      refresh();
    } catch {
      toast.error("Failed to delete goal");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-white/60">
          {filtered.length} goal{filtered.length === 1 ? "" : "s"}
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
        {filtered.length === 0 ? (
          <p className="text-center text-white/60 py-8">No goals found.</p>
        ) : (
          filtered.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">
                      {goal.userName}
                    </span>
                    <span className="text-white/60 text-xs">·</span>
                    <span className="text-sm">
                      {STAT_LABELS[goal.statCategory as StatCategory] ??
                        goal.statCategory}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">
                    Target:{" "}
                    {formatStat(
                      goal.targetValue,
                      goal.statCategory as StatCategory
                    )}{" "}
                    ({goal.direction}) by{" "}
                    {format(new Date(goal.targetDate), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {goal.isCompleted ? (
                    <Badge className="bg-primary text-xs">Done</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/40 hover:text-destructive"
                    onClick={() => setDeleteGoal(goal)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteGoal}
        onOpenChange={(open) => !open && setDeleteGoal(null)}
        title="Delete Goal?"
        description={`Delete ${deleteGoal?.userName}'s goal for ${deleteGoal ? STAT_LABELS[deleteGoal.statCategory as StatCategory] ?? deleteGoal.statCategory : ""}? This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
