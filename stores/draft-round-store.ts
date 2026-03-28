import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { HoleData, CourseInfo, EntryMode, ShotData, HoleShape } from "@/lib/types";
import type { PuttData } from "@/components/round-entry/putt-step-card";

type Phase = "shot" | "putt" | "summary";

export interface DraftWizardState {
  step: number;
  notes: string;
  entryMode: EntryMode;
  course: CourseInfo;
  holes: HoleData[];
  date: string;
  isManualEntry: boolean;
}

export interface DraftShotFlowState {
  holeIndex: number;
  phase: Phase;
  shots: ShotData[];
  putts: PuttData[];
  holeShape?: HoleShape;
  completedHoles: HoleData[];
  summaryHole: HoleData | null;
  history: Array<{ phase: Phase; shots: ShotData[]; putts: PuttData[] }>;
}

interface DraftRound {
  id: string;
  savedAt: string;
  wizard: DraftWizardState;
  shotFlow: DraftShotFlowState | null;
}

interface DraftRoundStore {
  draft: DraftRound | null;
  saveDraft: (wizard: DraftWizardState, shotFlow: DraftShotFlowState | null) => void;
  clearDraft: () => void;
}

export const useDraftRoundStore = create<DraftRoundStore>()(
  persist(
    (set, get) => ({
      draft: null,

      saveDraft: (wizard, shotFlow) => {
        const existing = get().draft;
        set({
          draft: {
            id: existing?.id ?? crypto.randomUUID(),
            savedAt: new Date().toISOString(),
            wizard,
            shotFlow,
          },
        });
      },

      clearDraft: () => set({ draft: null }),
    }),
    {
      name: "golf-draft-round-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
