import { create } from 'zustand';

interface Store {
  energy: number;
  targetEnergy: number;
  config: Scene3Config;
  addEnergy: (amount: number) => void;
  updateEnergy: (delta: number) => void;
}

export interface Scene3Config {
  cloudScaleMultiplier: number;
  cloudCount: number;
  cloudMoveDirectionDeg: number;
  cloudMoveSpeed: number;
  cloudMoveAmplitude: number;
  cloudMotionEnabled: boolean;
  proceduralCloudOpacity: number;
  proceduralCloudColor: string;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  directionalLightColor: string;
  directionalLightPosition: [number, number, number];
  animationEnergyBoost: number;
}

const defaultConfig: Scene3Config = {
  cloudScaleMultiplier: 1.2,
  cloudCount: 5,
  cloudMoveDirectionDeg: 87,
  cloudMoveSpeed: 0.8,
  cloudMoveAmplitude: 20,
  cloudMotionEnabled: true,
  proceduralCloudOpacity: 0.95,
  proceduralCloudColor: '#e9f4fb',
  ambientLightIntensity: 1.5,
  directionalLightIntensity: 3,
  directionalLightColor: '#b1c9cd',
  directionalLightPosition: [5, 10, 5],
  animationEnergyBoost: 2,
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
