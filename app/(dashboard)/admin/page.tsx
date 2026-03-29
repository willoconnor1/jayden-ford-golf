"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { AdminUsersTab } from "@/components/admin/admin-users-tab";
import { AdminRoundsTab } from "@/components/admin/admin-rounds-tab";
import { AdminGoalsTab } from "@/components/admin/admin-goals-tab";
import type { Round, Goal } from "@/lib/types";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  roundCount: number;
  goalCount: number;
}

interface AdminRound extends Round {
  userId: string;
  userName: string;
  userEmail: string;
}

interface AdminGoal extends Goal {
  userId: string;
  userName: string;
  userEmail: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [rounds, setRounds] = useState<AdminRound[]>([]);
  const [roundUsers, setRoundUsers] = useState<UserInfo[]>([]);
  const [goals, setGoals] = useState<AdminGoal[]>([]);
  const [goalUsers, setGoalUsers] = useState<UserInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [usersRes, roundsRes, goalsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/rounds"),
        fetch("/api/admin/goals"),
      ]);

      if (usersRes.status === 403 || roundsRes.status === 403) {
        throw new Error("You don't have admin access");
      }
      if (!usersRes.ok || !roundsRes.ok || !goalsRes.ok) {
        throw new Error("Failed to load admin data");
      }

      const [usersData, roundsData, goalsData] = await Promise.all([
        usersRes.json(),
        roundsRes.json(),
        goalsRes.json(),
      ]);

      setUsers(usersData.users);
      setRounds(roundsData.rounds);
      setRoundUsers(roundsData.users);
      setGoals(goalsData.goals);
      setGoalUsers(goalsData.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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

  return (
    <>
      <PageHeader
        title="Admin Control Center"
        description={`${users.length} user${users.length === 1 ? "" : "s"} · ${rounds.length} round${rounds.length === 1 ? "" : "s"} · ${goals.length} goal${goals.length === 1 ? "" : "s"}`}
      />

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <AdminUsersTab users={users} refresh={fetchAll} />
        </TabsContent>

        <TabsContent value="rounds">
          <AdminRoundsTab
            rounds={rounds}
            users={roundUsers}
            refresh={fetchAll}
          />
        </TabsContent>

        <TabsContent value="goals">
          <AdminGoalsTab
            goals={goals}
            users={goalUsers}
            refresh={fetchAll}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
