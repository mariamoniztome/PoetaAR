import { create } from 'zustand';

interface Store {
  energy: number;
  targetEnergy: number;
  config: Scene2Config;
  addEnergy: (amount: number) => void;
  updateEnergy: (delta: number) => void;
}

export interface Scene2Config {
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

const defaultConfig: Scene2Config = {
  flowerCount: 700,
  grassCount: 5000,
  flowerFieldRadius: 5,
  grassFieldRadius: 6,
  flowerScale: 0.04,
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
