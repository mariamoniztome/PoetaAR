import { Canvas } from '@react-three/fiber';
import { ARScene } from './components/ARScene';
import { useStore } from './store';
import { AudioExperience } from '../components/AudioExperience';
import { CameraBackground } from '../components/CameraBackground';
import { EnergyDebug } from '../components/EnergyDebug';
import { MobileLogger } from '../components/MobileLogger';
import { SOUND_PATHS } from '../constants/assets';
import {
  DebugColorInput,
  DebugNumberInput,
  DebugSection,
  DebugToggleInput,
  SceneDebugPanel,
} from '../components/debug/SceneDebugPanel';

interface Scene3Props {
  title?: string;
  description?: string;
}

export default function Scene3({
  title = 'Ceu Aberto',
  description = 'Mexe o rato ou o telemovel para desorganizar o bando de passaros.',
}: Scene3Props) {
  const debugConfig = useStore((state) => state.debugConfig);
  const setDebugConfig = useStore((state) => state.setDebugConfig);
  const resetDebugConfig = useStore((state) => state.resetDebugConfig);

  const updateLightPos = (index: 0 | 1 | 2, value: number) => {
    const next = [...debugConfig.directionalLightPosition] as [number, number, number];
    next[index] = value;
    setDebugConfig({ directionalLightPosition: next });
  };

  const updateFlockPos = (index: 0 | 1 | 2, value: number) => {
    const next = [...debugConfig.flockPosition] as [number, number, number];
    next[index] = value;
    setDebugConfig({ flockPosition: next });
  };

  return (
    <div className="w-full h-full bg-black relative overflow-hidden font-sans">
      <CameraBackground />
      <EnergyDebug />
      <MobileLogger />

      <AudioExperience
        backgroundUrl={SOUND_PATHS.SKY_BG}
        narrationUrl={SOUND_PATHS.SKY_NARRATION}
      />

      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        className="z-10"
      >
        <ARScene />
      </Canvas>

      {/* <SceneDebugPanel title="Debug Scene 3" values={{ debugConfig }} onReset={resetDebugConfig}>
        <DebugSection title="GLB Repeticao">
          <DebugNumberInput
            label="Passaros"
            value={debugConfig.birdCount}
            min={1}
            max={300}
            step={1}
            onChange={(value) => setDebugConfig({ birdCount: Math.round(value) })}
          />
          <DebugNumberInput
            label="Escala"
            value={debugConfig.birdScale}
            min={0.01}
            max={6}
            step={0.01}
            onChange={(value) => setDebugConfig({ birdScale: value })}
          />
          <DebugNumberInput
            label="Pos X"
            value={debugConfig.flockPosition[0]}
            step={0.1}
            onChange={(value) => updateFlockPos(0, value)}
          />
          <DebugNumberInput
            label="Pos Y"
            value={debugConfig.flockPosition[1]}
            step={0.1}
            onChange={(value) => updateFlockPos(1, value)}
          />
          <DebugNumberInput
            label="Pos Z"
            value={debugConfig.flockPosition[2]}
            step={0.1}
            onChange={(value) => updateFlockPos(2, value)}
          />
        </DebugSection>

        <DebugSection title="Luz e Nuvens">
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
            label="Cor Luz"
            value={debugConfig.directionalLightColor}
            onChange={(value) => setDebugConfig({ directionalLightColor: value })}
          />
          <DebugColorInput
            label="Cor Nuvem"
            value={debugConfig.proceduralCloudColor}
            onChange={(value) => setDebugConfig({ proceduralCloudColor: value })}
          />
          <DebugNumberInput
            label="Numero Nuvens"
            value={debugConfig.cloudCount}
            min={1}
            max={20}
            step={1}
            onChange={(value) => setDebugConfig({ cloudCount: Math.round(value) })}
          />
          <DebugNumberInput
            label="Direcao (graus)"
            value={debugConfig.cloudMoveDirectionDeg}
            min={-180}
            max={180}
            step={1}
            onChange={(value) => setDebugConfig({ cloudMoveDirectionDeg: value })}
          />
          <DebugToggleInput
            label="Nuvens em movimento"
            checked={debugConfig.cloudMotionEnabled}
            onChange={(checked) => setDebugConfig({ cloudMotionEnabled: checked })}
          />
          <DebugNumberInput
            label="Velocidade"
            value={debugConfig.cloudMoveSpeed}
            min={0}
            max={5}
            step={0.01}
            onChange={(value) => setDebugConfig({ cloudMoveSpeed: value })}
          />
          <DebugNumberInput
            label="Max Horizontal"
            value={debugConfig.cloudMoveAmplitude}
            min={0}
            max={30}
            step={0.1}
            onChange={(value) => setDebugConfig({ cloudMoveAmplitude: value })}
          />
          <DebugNumberInput
            label="Escala Nuvem"
            value={debugConfig.cloudScaleMultiplier}
            min={0.1}
            max={5}
            step={0.01}
            onChange={(value) => setDebugConfig({ cloudScaleMultiplier: value })}
          />
          <DebugNumberInput
            label="Opacity Nuvem"
            value={debugConfig.proceduralCloudOpacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => setDebugConfig({ proceduralCloudOpacity: value })}
          />
        </DebugSection>
      </SceneDebugPanel> */}
    </div>
  );
}
