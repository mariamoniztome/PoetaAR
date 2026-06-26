import { create } from 'zustand';

interface Store {
  energy: number;
  targetEnergy: number;
  debugConfig: Scene3DebugConfig;
  addEnergy: (amount: number) => void;
  updateEnergy: (delta: number) => void;
  setDebugConfig: (partial: Partial<Scene3DebugConfig>) => void;
  resetDebugConfig: () => void;
}

export interface Scene3DebugConfig {
  birdCount: number;
  birdScale: number;
  flockPosition: [number, number, number];
  baseNoise: number;
  stormNoiseMultiplier: number;
  baseLerpSpeed: number;
  stormLerpSpeed: number;
  animationBaseSpeed: number;
  animationEnergyBoost: number;
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
}

export const defaultScene3DebugConfig: Scene3DebugConfig = {
  birdCount: 10,
  birdScale: 0.03,
  flockPosition: [0, 0, 1],
  baseNoise: 0.2,
  stormNoiseMultiplier: 5,
  baseLerpSpeed: 0.05,
  stormLerpSpeed: 0.02,
  animationBaseSpeed: 1,
  animationEnergyBoost: 2,
  cloudScaleMultiplier: 1.2,
  cloudCount: 5,
  cloudMoveDirectionDeg: 87,
  cloudMoveSpeed: 0.02,
  cloudMoveAmplitude: 4.5,
  cloudMotionEnabled: true,
  proceduralCloudOpacity: 0.95,
  proceduralCloudColor: '#e9f4fb',
  ambientLightIntensity: 1.5,
  directionalLightIntensity: 3,
  directionalLightColor: '#b1c9cd',
  directionalLightPosition: [5, 10, 5],
};

export const useStore = create<Store>((set) => ({
  energy: 0,
  targetEnergy: 0,
  debugConfig: defaultScene3DebugConfig,
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
  resetDebugConfig: () => set({ debugConfig: defaultScene3DebugConfig }),
}));
