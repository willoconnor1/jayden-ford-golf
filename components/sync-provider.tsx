"use client";

import { useEffect, useRef } from "react";
import { useRoundStore } from "@/stores/round-store";
import { useGoalStore } from "@/stores/goal-store";
import { pullFromDb, pushToDb } from "@/lib/sync";

const RESYNC_INTERVAL = 30_000; // Re-pull from DB every 30 seconds

/**
 * SyncProvider — multi-user safe sync:
 * 1. Pull all data from Postgres (source of truth)
 * 2. Merge: DB wins for conflicts, local-only items get pushed up
 * 3. Re-syncs periodically so both users see each other's changes
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const hasInitialSync = useRef(false);

  useEffect(() => {
    async function sync() {
      const remote = await pullFromDb();
      if (!remote) return; // DB not available, stay local-only

      const localRounds = useRoundStore.getState().rounds;
      const localGoals = useGoalStore.getState().goals;

      // ── Merge rounds (DB is source of truth) ──────────────
      const remoteRoundMap = new Map(remote.rounds.map((r) => [r.id, r]));
      const localRoundMap = new Map(localRounds.map((r) => [r.id, r]));

      // Start with all remote rounds (DB wins)
      const mergedRounds = [...remote.rounds];

      // Add any local-only rounds that aren't in DB yet
      // (e.g. added while offline, or on a fresh push)
      const localOnlyRounds = localRounds.filter(
        (r) => !remoteRoundMap.has(r.id)
      );
      mergedRounds.push(...localOnlyRounds);

      // For rounds that exist in both, DB version wins
      // (since mutations sync to DB immediately, DB should have the latest)

      // ── Merge goals (DB is source of truth) ────────────────
      const remoteGoalMap = new Map(remote.goals.map((g) => [g.id, g]));

      const mergedGoals = [...remote.goals];
      const localOnlyGoals = localGoals.filter(
        (g) => !remoteGoalMap.has(g.id)
      );
      mergedGoals.push(...localOnlyGoals);

      // Update local stores with merged data
      useRoundStore.setState({ rounds: mergedRounds });
      useGoalStore.setState({ goals: mergedGoals });

      // Push any local-only items up to DB (no deletes)
      if (localOnlyRounds.length > 0 || localOnlyGoals.length > 0) {
        pushToDb(localOnlyRounds, localOnlyGoals);
      }
    }

    // Initial sync
    if (!hasInitialSync.current) {
      hasInitialSync.current = true;
      sync();
    }

    // Periodic re-sync so both users see each other's updates
    const interval = setInterval(sync, RESYNC_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
