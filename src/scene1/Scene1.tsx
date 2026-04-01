import { Canvas } from '@react-three/fiber';
import { ARScene } from './components/ARScene';
import { useStore } from './store';
import { AudioExperience } from '../components/AudioExperience';
import { CameraBackground } from '../components/CameraBackground';
import { SOUND_PATHS } from '../constants/assets';

interface Scene1Props {
  modelUrl?: string;
  title?: string;
  description?: string;
}

export default function Scene1({ 
  modelUrl, 
  title = "Alto Mar", 
  description = "Mexe o rato ou o telemóvel para agitar as águas." 
}: Scene1Props) {
  const energy = useStore((state) => state.energy);

  return (
    <div className="w-full h-full bg-black relative overflow-hidden font-sans">
      {/* Camera feed in the background */}
      <CameraBackground />

      {/* Audio Experience for Scene 1 */}
      <AudioExperience 
        backgroundUrl={SOUND_PATHS.SEA_BG} 
        narrationUrl={SOUND_PATHS.SEA_NARRATION} 
      />

      {/* 3D Canvas */}
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        className="z-10"
      >
        <ARScene modelUrl={modelUrl} />
      </Canvas>
    </div>
  );
}
