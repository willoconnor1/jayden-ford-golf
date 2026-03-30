"use client";

import { useState, useMemo } from "react";
import { type ColumnDef, DataTable } from "@/components/ui/data-table";
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

  const filtered = useMemo(
    () =>
      filterUser === "all"
        ? goals
        : goals.filter((g) => g.userId === filterUser),
    [goals, filterUser]
  );

  const columns: ColumnDef<AdminGoal, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "userName",
        header: "Player",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.userName}</span>
        ),
      },
      {
        accessorKey: "statCategory",
        header: "Category",
        cell: ({ row }) => (
          <span>
            {STAT_LABELS[row.original.statCategory as StatCategory] ??
              row.original.statCategory}
          </span>
        ),
      },
      {
        accessorKey: "targetValue",
        header: "Target",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatStat(
              row.original.targetValue,
              row.original.statCategory as StatCategory
            )}
          </span>
        ),
      },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize text-xs">
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
        cell: ({ row }) =>
          row.original.isCompleted ? (
            <Badge className="bg-primary text-xs">Done</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Active</Badge>
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
              setDeleteGoal(row.original);
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
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No goals found."
        toolbar={
          <>
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
            <span className="text-xs text-muted-foreground ml-auto self-end">
              {filtered.length} goal{filtered.length === 1 ? "" : "s"}
            </span>
          </>
        }
      />

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
