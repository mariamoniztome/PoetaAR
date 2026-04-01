import { Canvas } from '@react-three/fiber';
import { ARScene } from './components/ARScene';
import { useStore } from './store';
import { AudioExperience } from '../components/AudioExperience';
import { CameraBackground } from '../components/CameraBackground';
import { SOUND_PATHS } from '../constants/assets';

interface Scene2Props {
  title?: string;
  description?: string;
}

export default function Scene2({ 
  title = "Campo de Flores", 
  description = "Mexe o rato ou o telemóvel para criar vento nas flores." 
}: Scene2Props) {
  const energy = useStore((state) => state.energy);

  return (
    <div className="w-full h-full bg-black relative overflow-hidden font-sans">
      {/* Camera feed in the background */}
      <CameraBackground />

      {/* Audio Experience for Scene 2 */}
      <AudioExperience 
        backgroundUrl={SOUND_PATHS.FIELD_BG} 
        narrationUrl={SOUND_PATHS.FIELD_NARRATION} 
      />

      {/* 3D Canvas */}
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        className="z-10"
      >
        <ARScene />
      </Canvas>
    </div>
  );
}
