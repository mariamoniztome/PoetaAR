import { create } from 'zustand';

interface Store {
  energy: number;
  targetEnergy: number;
  addEnergy: (amount: number) => void;
  updateEnergy: (delta: number) => void;
}

export const useStore = create<Store>((set) => ({
  energy: 0,
  targetEnergy: 0,
  addEnergy: (amount) => set((state) => ({ 
    targetEnergy: Math.min(state.targetEnergy + amount, 1) 
  })),
  updateEnergy: (delta) => set((state) => {
    const newTarget = Math.max(state.targetEnergy - delta * 0.2, 0);
    const newEnergy = state.energy + (newTarget - state.energy) * delta * 2.0;
    return { targetEnergy: newTarget, energy: newEnergy };
  })
}));
