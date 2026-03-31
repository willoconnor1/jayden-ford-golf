"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef, DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CreateUserDialog } from "./create-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
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
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const columns: ColumnDef<AdminUser, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {format(new Date(row.original.createdAt), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        accessorKey: "roundCount",
        header: "Rounds",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.roundCount}</span>
        ),
      },
      {
        accessorKey: "goalCount",
        header: "Goals",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.goalCount}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setEditUser(row.original);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteUser(row.original);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

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
      setConfirmName("");
      refresh();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredUsers}
        onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
        emptyMessage="No users found."
        toolbar={
          <>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">
                {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
              </span>
              <Button size="sm" className="h-8" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create User
              </Button>
            </div>
          </>
        }
      />

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

      <Dialog
        open={!!deleteUser}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUser(null);
            setConfirmName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteUser?.name}?</DialogTitle>
            <DialogDescription>
              This will permanently delete {deleteUser?.name}&apos;s account and
              all their data ({deleteUser?.roundCount} rounds,{" "}
              {deleteUser?.goalCount} goals). This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <span className="font-bold">{deleteUser?.name}</span> to
              confirm
            </label>
            <Input
              placeholder={deleteUser?.name ?? ""}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteUser(null);
                setConfirmName("");
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleting ||
                confirmName.trim().toLowerCase() !==
                  (deleteUser?.name ?? "").trim().toLowerCase()
              }
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
