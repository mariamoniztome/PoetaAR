import { create } from 'zustand';

interface Store {
  energy: number;
  targetEnergy: number;
  debugConfig: Scene1DebugConfig;
  addEnergy: (amount: number) => void;
  updateEnergy: (delta: number) => void;
  setDebugConfig: (partial: Partial<Scene1DebugConfig>) => void;
  resetDebugConfig: () => void;
}

export interface Scene1DebugConfig {
  objectCount: number;
  objectSpread: number;
  floatingScale: number;
  floatingPosition: [number, number, number];
  floatBaseAmplitude: number;
  floatEnergyAmplitude: number;
  detailBaseAmplitude: number;
  detailEnergyAmplitude: number;
  yOffset: number;
  rotationBaseAmplitude: number;
  rotationEnergyAmplitude: number;
  animationBaseSpeed: number;
  animationEnergyBoost: number;
  oceanDeepColor: string;
  oceanShallowColor: string;
  oceanOpacity: number;
  oceanWaveBase: number;
  oceanWaveEnergy: number;
  oceanDetailBase: number;
  oceanDetailEnergy: number;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  directionalLightColor: string;
  directionalLightPosition: [number, number, number];
}

export const defaultScene1DebugConfig: Scene1DebugConfig = {
  objectCount: 1,
  objectSpread: 0,
  floatingScale: 0.085,
  floatingPosition: [0, 0, -12],
  floatBaseAmplitude: 0,
  floatEnergyAmplitude: 0,
  detailBaseAmplitude: 0,
  detailEnergyAmplitude: 0,
  yOffset: -1.75,
  rotationBaseAmplitude: 0,
  rotationEnergyAmplitude: 0,
  animationBaseSpeed: 0,
  animationEnergyBoost: 0,
  oceanDeepColor: '#001e36',
  oceanShallowColor: '#006994',
  oceanOpacity: 0.6,
  oceanWaveBase: 0.5,
  oceanWaveEnergy: 1.5,
  oceanDetailBase: 0.1,
  oceanDetailEnergy: 0.5,
  ambientLightIntensity: 0.8,
  directionalLightIntensity: 1.5,
  directionalLightColor: '#ffffff',
  directionalLightPosition: [10, 10, 5],
};

export const useStore = create<Store>((set) => ({
  energy: 0,
  targetEnergy: 0,
  debugConfig: defaultScene1DebugConfig,
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
  resetDebugConfig: () => set({ debugConfig: defaultScene1DebugConfig }),
}));

