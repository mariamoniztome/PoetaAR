import { Canvas } from '@react-three/fiber';
import { ARScene } from './components/ARScene';
import { useStore } from './store';
import { AudioExperience } from '../components/AudioExperience';
import { CameraBackground } from '../components/CameraBackground';
import { SOUND_PATHS } from '../constants/assets';
import {
  DebugColorInput,
  DebugNumberInput,
  DebugSection,
  SceneDebugPanel,
} from '../components/debug/SceneDebugPanel';

interface Scene1Props {
  modelUrl?: string;
  title?: string;
  description?: string;
}

export default function Scene1({
  modelUrl,
  title = 'Alto Mar',
  description = 'Mexe o rato ou o telemovel para agitar as aguas.',
}: Scene1Props) {
  const energy = useStore((state) => state.energy);
  const targetEnergy = useStore((state) => state.targetEnergy);
  const debugConfig = useStore((state) => state.debugConfig);
  const setDebugConfig = useStore((state) => state.setDebugConfig);
  const resetDebugConfig = useStore((state) => state.resetDebugConfig);

  const updateLightPos = (index: 0 | 1 | 2, value: number) => {
    const next = [...debugConfig.directionalLightPosition] as [number, number, number];
    next[index] = value;
    setDebugConfig({ directionalLightPosition: next });
  };

  const updateObjectPos = (index: 0 | 1 | 2, value: number) => {
    const next = [...debugConfig.floatingPosition] as [number, number, number];
    next[index] = value;
    setDebugConfig({ floatingPosition: next });
  };

  return (
    <div className="w-full h-full bg-black relative overflow-hidden font-sans">
      <CameraBackground />

      <AudioExperience
        backgroundUrl={SOUND_PATHS.SEA_BG}
        narrationUrl={SOUND_PATHS.SEA_NARRATION}
      />

      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        className="z-10"
      >
        <ARScene modelUrl={modelUrl} />
      </Canvas>

      <SceneDebugPanel
        title="Debug Scene 1"
        values={{ energy, targetEnergy, debugConfig }}
        onReset={resetDebugConfig}
      >
        <DebugSection title="Energia">
          <DebugNumberInput label="Atual" value={energy} step={0.001} onChange={() => {}} />
          <DebugNumberInput label="Target" value={targetEnergy} step={0.001} onChange={() => {}} />
        </DebugSection>

        <DebugSection title="GLB Repeticao">
          <DebugNumberInput
            label="Quantidade"
            value={debugConfig.objectCount}
            min={1}
            max={50}
            step={1}
            onChange={(value) => setDebugConfig({ objectCount: Math.round(value) })}
          />
          <DebugNumberInput
            label="Spread"
            value={debugConfig.objectSpread}
            min={0}
            max={20}
            step={0.1}
            onChange={(value) => setDebugConfig({ objectSpread: value })}
          />
          <DebugNumberInput
            label="Escala GLB"
            value={debugConfig.floatingScale}
            min={0.01}
            max={10}
            step={0.01}
            onChange={(value) => setDebugConfig({ floatingScale: value })}
          />
          <DebugNumberInput
            label="YOffset"
            value={debugConfig.yOffset}
            min={-10}
            max={10}
            step={0.01}
            onChange={(value) => setDebugConfig({ yOffset: value })}
          />
        </DebugSection>

        <DebugSection title="Posicao Base GLB">
          <DebugNumberInput
            label="X"
            value={debugConfig.floatingPosition[0]}
            step={0.1}
            onChange={(value) => updateObjectPos(0, value)}
          />
          <DebugNumberInput
            label="Y"
            value={debugConfig.floatingPosition[1]}
            step={0.1}
            onChange={(value) => updateObjectPos(1, value)}
          />
          <DebugNumberInput
            label="Z"
            value={debugConfig.floatingPosition[2]}
            step={0.1}
            onChange={(value) => updateObjectPos(2, value)}
          />
        </DebugSection>

        <DebugSection title="Movimento">
          <DebugNumberInput
            label="Float Base"
            value={debugConfig.floatBaseAmplitude}
            min={0}
            max={10}
            step={0.01}
            onChange={(value) => setDebugConfig({ floatBaseAmplitude: value })}
          />
          <DebugNumberInput
            label="Float Energy"
            value={debugConfig.floatEnergyAmplitude}
            min={0}
            max={10}
            step={0.01}
            onChange={(value) => setDebugConfig({ floatEnergyAmplitude: value })}
          />
          <DebugNumberInput
            label="Detail Base"
            value={debugConfig.detailBaseAmplitude}
            min={0}
            max={10}
            step={0.01}
            onChange={(value) => setDebugConfig({ detailBaseAmplitude: value })}
          />
          <DebugNumberInput
            label="Detail Energy"
            value={debugConfig.detailEnergyAmplitude}
            min={0}
            max={10}
            step={0.01}
            onChange={(value) => setDebugConfig({ detailEnergyAmplitude: value })}
          />
          <DebugNumberInput
            label="Rot Base"
            value={debugConfig.rotationBaseAmplitude}
            min={0}
            max={5}
            step={0.01}
            onChange={(value) => setDebugConfig({ rotationBaseAmplitude: value })}
          />
          <DebugNumberInput
            label="Rot Energy"
            value={debugConfig.rotationEnergyAmplitude}
            min={0}
            max={5}
            step={0.01}
            onChange={(value) => setDebugConfig({ rotationEnergyAmplitude: value })}
          />
          <DebugNumberInput
            label="Anim Base"
            value={debugConfig.animationBaseSpeed}
            min={0}
            max={5}
            step={0.01}
            onChange={(value) => setDebugConfig({ animationBaseSpeed: value })}
          />
          <DebugNumberInput
            label="Anim Energy"
            value={debugConfig.animationEnergyBoost}
            min={0}
            max={10}
            step={0.01}
            onChange={(value) => setDebugConfig({ animationEnergyBoost: value })}
          />
        </DebugSection>

        <DebugSection title="Oceano">
          <DebugColorInput
            label="Cor Deep"
            value={debugConfig.oceanDeepColor}
            onChange={(value) => setDebugConfig({ oceanDeepColor: value })}
          />
          <DebugColorInput
            label="Cor Shallow"
            value={debugConfig.oceanShallowColor}
            onChange={(value) => setDebugConfig({ oceanShallowColor: value })}
          />
          <DebugNumberInput
            label="Opacidade"
            value={debugConfig.oceanOpacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => setDebugConfig({ oceanOpacity: value })}
          />
          <DebugNumberInput
            label="Wave Base"
            value={debugConfig.oceanWaveBase}
            min={0}
            max={5}
            step={0.01}
            onChange={(value) => setDebugConfig({ oceanWaveBase: value })}
          />
          <DebugNumberInput
            label="Wave Energy"
            value={debugConfig.oceanWaveEnergy}
            min={0}
            max={10}
            step={0.01}
            onChange={(value) => setDebugConfig({ oceanWaveEnergy: value })}
          />
          <DebugNumberInput
            label="Detail Base"
            value={debugConfig.oceanDetailBase}
            min={0}
            max={5}
            step={0.01}
            onChange={(value) => setDebugConfig({ oceanDetailBase: value })}
          />
          <DebugNumberInput
            label="Detail Energy"
            value={debugConfig.oceanDetailEnergy}
            min={0}
            max={10}
            step={0.01}
            onChange={(value) => setDebugConfig({ oceanDetailEnergy: value })}
          />
        </DebugSection>

        <DebugSection title="Luz">
          <DebugNumberInput
            label="Ambient"
            value={debugConfig.ambientLightIntensity}
            min={0}
            max={5}
            step={0.1}
            onChange={(value) => setDebugConfig({ ambientLightIntensity: value })}
          />
          <DebugNumberInput
            label="Directional"
            value={debugConfig.directionalLightIntensity}
            min={0}
            max={10}
            step={0.1}
            onChange={(value) => setDebugConfig({ directionalLightIntensity: value })}
          />
          <DebugNumberInput
            label="Luz X"
            value={debugConfig.directionalLightPosition[0]}
            step={0.1}
            onChange={(value) => updateLightPos(0, value)}
          />
          <DebugNumberInput
            label="Luz Y"
            value={debugConfig.directionalLightPosition[1]}
            step={0.1}
            onChange={(value) => updateLightPos(1, value)}
          />
          <DebugNumberInput
            label="Luz Z"
            value={debugConfig.directionalLightPosition[2]}
            step={0.1}
            onChange={(value) => updateLightPos(2, value)}
          />
          <DebugColorInput
            label="Cor"
            value={debugConfig.directionalLightColor}
            onChange={(value) => setDebugConfig({ directionalLightColor: value })}
          />
        </DebugSection>
      </SceneDebugPanel>
    </div>
  );
}
