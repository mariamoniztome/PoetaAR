import { Canvas } from '@react-three/fiber';
import { ARScene } from './components/ARScene';
import { useStore } from './store';
import { AudioExperience } from '../components/AudioExperience';
import { CameraBackground } from '../components/CameraBackground';
import { SOUND_PATHS } from '../constants/assets';

interface Scene3Props {
  title?: string;
  description?: string;
}

export default function Scene3({ 
  title = "Céu Aberto", 
  description = "Mexe o rato ou o telemóvel para desorganizar o bando de pássaros." 
}: Scene3Props) {
  const energy = useStore((state) => state.energy);

  return (
    <div className="w-full h-full bg-black relative overflow-hidden font-sans">
      {/* Camera feed in the background */}
      <CameraBackground />

      {/* Audio Experience for Scene 3 */}
      <AudioExperience 
        backgroundUrl={SOUND_PATHS.SKY_BG} 
        narrationUrl={SOUND_PATHS.SKY_NARRATION} 
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
