import { create } from 'zustand';

interface Store {
  energy: number;
  targetEnergy: number;
  config: Scene1Config;
  addEnergy: (amount: number) => void;
  updateEnergy: (delta: number) => void;
}

export interface Scene1Config {
  oceanX: number;
  oceanY: number;
  oceanZ: number;
  oceanSize: number;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  directionalLightColor: string;
  directionalLightPosition: [number, number, number];
}

const defaultConfig: Scene1Config = {
  oceanX: 0,
  oceanY: -24.5,
  oceanZ: 20.5,
  oceanSize: 130,
  ambientLightIntensity: 0.8,
  directionalLightIntensity: 1.5,
  directionalLightColor: '#ffffff',
  directionalLightPosition: [10, 10, 5],
};

export const useStore = create<Store>((set) => ({
  energy: 0,
  targetEnergy: 0,
  config: defaultConfig,
  addEnergy: (amount) =>
    set((state) => ({ targetEnergy: Math.min(state.targetEnergy + amount, 1) })),
  updateEnergy: (delta) =>
    set((state) => {
      const newTarget = Math.max(state.targetEnergy - delta * 0.2, 0);
      const newEnergy = state.energy + (newTarget - state.energy) * delta * 2.0;
      return { targetEnergy: newTarget, energy: newEnergy };
    }),
}));
