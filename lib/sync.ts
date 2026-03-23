import type { Round, Goal } from "@/lib/types";

const API_BASE = "/api";

/** True when DATABASE_URL is configured (set at build time via Next.js) */
function isDbConfigured(): boolean {
  // On the client, we always attempt sync — the API routes will
  // return 500 if DATABASE_URL is missing, which we handle gracefully.
  return true;
}

// ── Individual CRUD helpers ───────────────────────────────────────

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${init?.method ?? "GET"} ${path}: ${res.status}`);
  return res.json();
}

// ── Round sync ────────────────────────────────────────────────────

export function syncAddRound(round: Round) {
  if (!isDbConfigured()) return;
  api("/rounds", { method: "POST", body: JSON.stringify(round) }).catch((e) =>
    console.warn("Background sync (add round) failed:", e)
  );
}

export function syncUpdateRound(round: Round) {
  if (!isDbConfigured()) return;
  api(`/rounds/${round.id}`, { method: "PUT", body: JSON.stringify(round) }).catch((e) =>
    console.warn("Background sync (update round) failed:", e)
  );
}

export function syncDeleteRound(id: string) {
  if (!isDbConfigured()) return;
  api(`/rounds/${id}`, { method: "DELETE" }).catch((e) =>
    console.warn("Background sync (delete round) failed:", e)
  );
}

// ── Goal sync ─────────────────────────────────────────────────────

export function syncAddGoal(goal: Goal) {
  if (!isDbConfigured()) return;
  api("/goals", { method: "POST", body: JSON.stringify(goal) }).catch((e) =>
    console.warn("Background sync (add goal) failed:", e)
  );
}

export function syncUpdateGoal(goal: Goal) {
  if (!isDbConfigured()) return;
  api(`/goals/${goal.id}`, { method: "PUT", body: JSON.stringify(goal) }).catch((e) =>
    console.warn("Background sync (update goal) failed:", e)
  );
}

export function syncDeleteGoal(id: string) {
  if (!isDbConfigured()) return;
  api(`/goals/${id}`, { method: "DELETE" }).catch((e) =>
    console.warn("Background sync (delete goal) failed:", e)
  );
}

// ── Full sync (pull from DB → merge into local state) ─────────────

export async function pullFromDb(): Promise<{
  rounds: Round[];
  goals: Goal[];
} | null> {
  try {
    return await api("/sync");
  } catch {
    console.warn("Pull from DB failed — running in local-only mode");
    return null;
  }
}

export async function pushToDb(rounds: Round[], goals: Goal[]) {
  try {
    await api("/sync", {
      method: "POST",
      body: JSON.stringify({ rounds, goals }),
    });
  } catch (e) {
    console.warn("Push to DB failed:", e);
  }
}
