"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CreateUserDialog } from "./create-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  roundCount: number;
  goalCount: number;
}

interface AdminUsersTabProps {
  users: AdminUser[];
  refresh: () => void;
}

export function AdminUsersTab({ users, refresh }: AdminUsersTabProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete user");
        return;
      }

      toast.success(`Deleted ${deleteUser.name}`);
      setDeleteUser(null);
      refresh();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-white/60">
          {users.length} user{users.length === 1 ? "" : "s"}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{u.name}</p>
                  <p className="text-xs text-white/60 truncate">{u.email}</p>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/50 hover:text-foreground"
                    onClick={() => setEditUser(u)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/50 hover:text-destructive"
                    onClick={() => setDeleteUser(u)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">
                  {u.roundCount} round{u.roundCount === 1 ? "" : "s"}
                </Badge>
                <Badge variant="secondary">
                  {u.goalCount} goal{u.goalCount === 1 ? "" : "s"}
                </Badge>
              </div>
              <p className="text-xs text-white/40 mt-2">
                Joined {format(new Date(u.createdAt), "MMM d, yyyy")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refresh}
      />

      <EditUserDialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        user={editUser}
        onUpdated={refresh}
      />

      <ConfirmDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        title={`Delete ${deleteUser?.name}?`}
        description={`This will permanently delete ${deleteUser?.name}'s account and all their data (${deleteUser?.roundCount} rounds, ${deleteUser?.goalCount} goals). This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
