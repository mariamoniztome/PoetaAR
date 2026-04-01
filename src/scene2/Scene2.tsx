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

interface Scene2Props {
  title?: string;
  description?: string;
}

export default function Scene2({
  title = 'Campo de Flores',
  description = 'Mexe o rato ou o telemovel para criar vento nas flores.',
}: Scene2Props) {
  const debugConfig = useStore((state) => state.debugConfig);
  const setDebugConfig = useStore((state) => state.setDebugConfig);
  const resetDebugConfig = useStore((state) => state.resetDebugConfig);

  const updateLightPos = (index: 0 | 1 | 2, value: number) => {
    const next = [...debugConfig.directionalLightPosition] as [number, number, number];
    next[index] = value;
    setDebugConfig({ directionalLightPosition: next });
  };

  return (
    <div className="w-full h-full bg-black relative overflow-hidden font-sans">
      <CameraBackground />

      <AudioExperience
        backgroundUrl={SOUND_PATHS.FIELD_BG}
        narrationUrl={SOUND_PATHS.FIELD_NARRATION}
      />

      <Canvas
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        className="z-10"
      >
        <ARScene />
      </Canvas>

      {/* <SceneDebugPanel title="Debug Scene 2" values={{ debugConfig }} onReset={resetDebugConfig}>
        <DebugSection title="GLB Repeticao">
          <DebugNumberInput
            label="Flores"
            value={debugConfig.flowerCount}
            min={0}
            max={5000}
            step={1}
            onChange={(value) => setDebugConfig({ flowerCount: Math.round(value) })}
          />
          <DebugNumberInput
            label="Relva"
            value={debugConfig.grassCount}
            min={0}
            max={100000}
            step={1}
            onChange={(value) => setDebugConfig({ grassCount: Math.round(value) })}
          />
          <DebugNumberInput
            label="Escala Flor"
            value={debugConfig.flowerScale}
            min={0.1}
            max={6}
            step={0.1}
            onChange={(value) => setDebugConfig({ flowerScale: value })}
          />
          <DebugNumberInput
            label="Raio Flores"
            value={debugConfig.flowerFieldRadius}
            min={1}
            max={40}
            step={0.1}
            onChange={(value) => setDebugConfig({ flowerFieldRadius: value })}
          />
          <DebugNumberInput
            label="Raio Relva"
            value={debugConfig.grassFieldRadius}
            min={1}
            max={40}
            step={0.1}
            onChange={(value) => setDebugConfig({ grassFieldRadius: value })}
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
      </SceneDebugPanel> */}
    </div>
  );
}

