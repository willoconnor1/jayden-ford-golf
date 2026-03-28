import type { Round, Goal, SavedCourse } from "@/lib/types";

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

/** Fire-and-forget with one retry after 2s on failure */
function fireAndForget(fn: () => Promise<unknown>, label: string) {
  fn().catch((e) => {
    console.warn(`Background sync (${label}) failed, retrying in 2s:`, e);
    setTimeout(() => {
      fn().catch((e2) =>
        console.warn(`Background sync (${label}) retry failed:`, e2)
      );
    }, 2000);
  });
}

// ── Round sync ────────────────────────────────────────────────────

export function syncAddRound(round: Round) {
  if (!isDbConfigured()) return;
  fireAndForget(
    () => api("/rounds", { method: "POST", body: JSON.stringify(round) }),
    "add round"
  );
}

export function syncUpdateRound(round: Round) {
  if (!isDbConfigured()) return;
  fireAndForget(
    () => api(`/rounds/${round.id}`, { method: "PUT", body: JSON.stringify(round) }),
    "update round"
  );
}

export function syncDeleteRound(id: string) {
  if (!isDbConfigured()) return;
  fireAndForget(
    () => api(`/rounds/${id}`, { method: "DELETE" }),
    "delete round"
  );
}

// ── Goal sync ─────────────────────────────────────────────────────

export function syncAddGoal(goal: Goal) {
  if (!isDbConfigured()) return;
  fireAndForget(
    () => api("/goals", { method: "POST", body: JSON.stringify(goal) }),
    "add goal"
  );
}

export function syncUpdateGoal(goal: Goal) {
  if (!isDbConfigured()) return;
  fireAndForget(
    () => api(`/goals/${goal.id}`, { method: "PUT", body: JSON.stringify(goal) }),
    "update goal"
  );
}

export function syncDeleteGoal(id: string) {
  if (!isDbConfigured()) return;
  fireAndForget(
    () => api(`/goals/${id}`, { method: "DELETE" }),
    "delete goal"
  );
}

// ── Course sync ──────────────────────────────────────────────────

export function syncSaveCourse(course: SavedCourse) {
  if (!isDbConfigured()) return;
  fireAndForget(
    () => api("/courses", { method: "POST", body: JSON.stringify(course) }),
    "save course"
  );
}

// ── Full sync (pull from DB → merge into local state) ─────────────

export async function pullFromDb(): Promise<{
  rounds: Round[];
  goals: Goal[];
  courses: SavedCourse[];
} | null> {
  try {
    return await api("/sync");
  } catch {
    console.warn("Pull from DB failed — running in local-only mode");
    return null;
  }
}

export async function pushToDb(
  rounds: Round[],
  goals: Goal[],
  courses?: SavedCourse[]
) {
  try {
    await api("/sync", {
      method: "POST",
      body: JSON.stringify({ rounds, goals, courses }),
    });
  } catch (e) {
    console.warn("Push to DB failed:", e);
  }
}
