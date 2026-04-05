import { persist } from "zustand/middleware";
import { Lineup, LineupSchema, newLineupDefaults } from "../models/lineup";
import { create } from 'zustand'


type LineupsState = {
  lineups: Lineup[];
  addLineup: (payload: Partial<Lineup>) => Lineup;
  updateLineup: (id: string, patch: Partial<Lineup>) => Lineup | null;
  deleteLineup: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setPracticeState: (id: string, state: Lineup["practiceState"]) => void;
  getById: (id: string) => Lineup | undefined;
};

export const useLineupsStore = create<LineupsState>()(
  persist(
    (set, get) => ({
      lineups: [],

      addLineup: (payload) => {
        const newL = newLineupDefaults(payload as Partial<Lineup>);
        set((s) => ({ lineups: [newL, ...s.lineups] }));
        return newL;
      },

      updateLineup: (id, patch) => {
        let updated: Lineup | null = null;
        set((s) => ({
          lineups: s.lineups.map((l) => {
            if (l.id !== id) return l;
            const merged = LineupSchema.parse({ ...l, ...patch, updatedAt: new Date().toISOString() });
            updated = merged;
            return merged;
          }),
        }));
        return updated;
      },

      deleteLineup: (id) => set((s) => ({ lineups: s.lineups.filter((l) => l.id !== id) })),

      toggleFavorite: (id) =>
        set((s) => ({
          lineups: s.lineups.map((l) => (l.id === id ? { ...l, favorite: !l.favorite } : l)),
        })),

      setPracticeState: (id, state) =>
        set((s) => ({
          lineups: s.lineups.map((l) => (l.id === id ? { ...l, practiceState: state } : l)),
        })),

      getById: (id) => get().lineups.find((l) => l.id === id),
    }),
    {
      name: "nadebook_lineups",
      version: 1,
      // Optionally add migrate/serialize here
    },
  ),
);

// Seed sample data when requested by the app (keeps store pure for tests)
let _seeded = false;

export const seedSampleLineups = () => {
  if (_seeded) return;
  const s = useLineupsStore.getState();
  if (s.lineups.length > 0) {
    _seeded = true;
    return;
  }

  const samples: Partial<Lineup>[] = [
    {
      name: "A Site Smoke - Long Plant",
      map: "de_dust2",
      site: "A",
      utilityType: "smoke",
      startPosition: "T spawn",
      target: "A long boxes",
      throwTechnique: "left_click",
      description: "Simple A long smoke for plant cover",
      tags: ["beginner"],
      imageUrls: [],
      // normalized coordinates on a map image (x, y) 0..1
      startCoords: [0.12, 0.75],
      targetCoords: [0.78, 0.22],
      favorite: true,
    },
    {
      name: "B Site Flash",
      map: "de_mirage",
      site: "B",
      utilityType: "flash",
      startPosition: "T apartments",
      target: "B short",
      throwTechnique: "right_click",
      description: "Pop flash for entry",
      tags: ["entry"],
      imageUrls: [],
      startCoords: [0.6, 0.25],
      targetCoords: [0.48, 0.55],
    },
    {
      name: "CT Spawn Molotov",
      map: "de_inferno",
      site: "Banana",
      utilityType: "molotov",
      startPosition: "CT spawn",
      target: "Banana boost",
      throwTechnique: "jumpthrow",
      description: "Molotov to clear boost",
      tags: ["advanced"],
      imageUrls: [],
      startCoords: [0.18, 0.42],
      targetCoords: [0.22, 0.18],
    },
  ];

  samples.forEach((samp) => s.addLineup(samp));
  _seeded = true;
};

