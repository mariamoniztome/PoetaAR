import { create } from 'zustand';

interface Store {
  energy: number;
  targetEnergy: number;
  debugConfig: Scene2DebugConfig;
  addEnergy: (amount: number) => void;
  updateEnergy: (delta: number) => void;
  setDebugConfig: (partial: Partial<Scene2DebugConfig>) => void;
  resetDebugConfig: () => void;
}

export interface Scene2DebugConfig {
  flowerCount: number;
  grassCount: number;
  flowerFieldRadius: number;
  grassFieldRadius: number;
  flowerScale: number;
  grassScaleMin: number;
  grassScaleMax: number;
  windBaseStrength: number;
  windEnergyStrength: number;
  windEnergySpeedBoost: number;
  groundColor: string;
  groundOpacity: number;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  directionalLightColor: string;
  directionalLightPosition: [number, number, number];
}

export const defaultScene2DebugConfig: Scene2DebugConfig = {
  flowerCount: 1200,
  grassCount: 50000,
  flowerFieldRadius: 10,
  grassFieldRadius: 10,
  flowerScale: 1.3,
  grassScaleMin: 0.8,
  grassScaleMax: 1.1,
  windBaseStrength: 0.08,
  windEnergyStrength: 1.2,
  windEnergySpeedBoost: 1.5,
  groundColor: '#1a3c15',
  groundOpacity: 0.7,
  ambientLightIntensity: 1,
  directionalLightIntensity: 1.5,
  directionalLightColor: '#ffffff',
  directionalLightPosition: [5, 10, 5],
};

export const useStore = create<Store>((set) => ({
  energy: 0,
  targetEnergy: 0,
  debugConfig: defaultScene2DebugConfig,
  addEnergy: (amount) =>
    set((state) => ({
      targetEnergy: Math.min(state.targetEnergy + amount, 1),
    })),
  updateEnergy: (delta) =>
    set((state) => {
      const newTarget = Math.max(state.targetEnergy - delta * 0.2, 0);
      const newEnergy = state.energy + (newTarget - state.energy) * delta * 2.0;
      return { targetEnergy: newTarget, energy: newEnergy };
    }),
  setDebugConfig: (partial) =>
    set((state) => ({
      debugConfig: {
        ...state.debugConfig,
        ...partial,
      },
    })),
  resetDebugConfig: () => set({ debugConfig: defaultScene2DebugConfig }),
}));
