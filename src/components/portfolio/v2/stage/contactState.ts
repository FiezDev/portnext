import { create } from 'zustand';

interface ContactState {
  burstCount: number;
  triggerBurst: () => void;
}

export const useContactState = create<ContactState>((set) => ({
  burstCount: 0,
  triggerBurst: () => set((s) => ({ burstCount: s.burstCount + 1 })),
}));
