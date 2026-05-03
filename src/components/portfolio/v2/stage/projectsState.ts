import { create } from 'zustand';

export type ProjectKind = 'work' | 'side';

interface ProjectsState {
  kind: ProjectKind;
  index: number;
  setKind: (k: ProjectKind) => void;
  setIndex: (i: number) => void;
  next: (max: number) => void;
  prev: (max: number) => void;
}

export const useProjectsState = create<ProjectsState>((set) => ({
  kind: 'work',
  index: 0,
  setKind: (kind) => set({ kind, index: 0 }),
  setIndex: (index) => set({ index }),
  next: (max) => set((s) => ({ index: (s.index + 1) % max })),
  prev: (max) => set((s) => ({ index: s.index === 0 ? max - 1 : s.index - 1 })),
}));
