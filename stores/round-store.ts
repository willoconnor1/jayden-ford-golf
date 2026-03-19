import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Round } from "@/lib/types";
import { getSeedRounds } from "@/lib/seed-data";

interface RoundStore {
  rounds: Round[];
  seeded: boolean;
  addRound: (round: Round) => void;
  updateRound: (id: string, updates: Partial<Round>) => void;
  deleteRound: (id: string) => void;
  getRound: (id: string) => Round | undefined;
  clearSeedData: () => void;
}

export const useRoundStore = create<RoundStore>()(
  persist(
    (set, get) => ({
      rounds: [],
      seeded: false,
      addRound: (round) =>
        set((state) => ({ rounds: [...state.rounds, round] })),
      updateRound: (id, updates) =>
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r
          ),
        })),
      deleteRound: (id) =>
        set((state) => ({
          rounds: state.rounds.filter((r) => r.id !== id),
        })),
      getRound: (id) => get().rounds.find((r) => r.id === id),
      clearSeedData: () =>
        set((state) => ({
          rounds: state.rounds.filter((r) => !r.id.startsWith("seed-round-")),
        })),
    }),
    {
      name: "golf-rounds-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Auto-seed demo data on first visit
        if (state && !state.seeded && state.rounds.length === 0) {
          state.rounds = getSeedRounds();
          state.seeded = true;
        }
      },
    }
  )
);
