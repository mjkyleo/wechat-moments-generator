import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Draft, Moment } from '../types/moment';
import { buildRandomDraft, buildSeedDraft, emptyDraft, emptyMoment, generateMoments } from '../data/presets';
import { uid } from '../utils/randomize';

interface DraftStore {
  draft: Draft;
  savedAt: number | null;
  setGlobal: (patch: Partial<Draft>) => void;
  addMoment: (partial?: Partial<Moment>) => string;
  updateMoment: (id: string, patch: Partial<Moment>) => void;
  deleteMoment: (id: string) => void;
  duplicateMoment: (id: string) => void;
  moveMoment: (id: string, dir: -1 | 1) => void;
  generate: (count: number) => void;
  loadMoments: (moments: Moment[]) => void;
  regenerate: () => void;
  clearAll: () => void;
  seedIfEmpty: () => void;
}

export const useDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      draft: emptyDraft(),
      savedAt: null,

      setGlobal: (patch) =>
        set((s) => ({ draft: { ...s.draft, ...patch }, savedAt: Date.now() })),

      addMoment: (partial) => {
        const moment = { ...emptyMoment(), ...partial, id: uid() };
        set((s) => ({
          draft: { ...s.draft, moments: [...s.draft.moments, moment] },
          savedAt: Date.now(),
        }));
        return moment.id;
      },

      updateMoment: (id, patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            moments: s.draft.moments.map((m) =>
              m.id === id ? { ...m, ...patch } : m,
            ),
          },
          savedAt: Date.now(),
        })),

      deleteMoment: (id) =>
        set((s) => ({
          draft: {
            ...s.draft,
            moments: s.draft.moments.filter((m) => m.id !== id),
          },
          savedAt: Date.now(),
        })),

      duplicateMoment: (id) =>
        set((s) => {
          const idx = s.draft.moments.findIndex((m) => m.id === id);
          if (idx < 0) return s;
          const copy = { ...s.draft.moments[idx], id: uid() };
          const moments = [...s.draft.moments];
          moments.splice(idx + 1, 0, copy);
          return { draft: { ...s.draft, moments }, savedAt: Date.now() };
        }),

      moveMoment: (id, dir) =>
        set((s) => {
          const moments = [...s.draft.moments];
          const idx = moments.findIndex((m) => m.id === id);
          const to = idx + dir;
          if (idx < 0 || to < 0 || to >= moments.length) return s;
          [moments[idx], moments[to]] = [moments[to], moments[idx]];
          return { draft: { ...s.draft, moments }, savedAt: Date.now() };
        }),

      generate: (count) =>
        set((s) => ({
          draft: {
            ...s.draft,
            moments: generateMoments(
              count,
              s.draft.moments.map((m) => m.authorName),
            ),
          },
          savedAt: Date.now(),
        })),

      loadMoments: (moments) =>
        set((s) => ({
          draft: { ...s.draft, moments },
          savedAt: Date.now(),
        })),

      regenerate: () => set({ draft: buildRandomDraft(), savedAt: Date.now() }),
      clearAll: () =>
        set((s) => ({ draft: { ...s.draft, moments: [] }, savedAt: Date.now() })),

      seedIfEmpty: () => {
        const s = get();
        if (s.draft.moments.length === 0 && s.savedAt === null) {
          set({ draft: buildSeedDraft() });
        }
      },
    }),
    {
      name: 'wechat-moments-draft-v5',
      partialize: (s) => ({ draft: s.draft }),
    },
  ),
);
