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

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex flex-col items-center justify-center text-white text-center">
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2 drop-shadow-lg">
          {title}
        </h1>
        <p className="text-sm opacity-80 max-w-md drop-shadow-md">
          {description}
        </p>
        
        {/* Wind Energy Indicator */}
        <div className="w-48 h-1 bg-white/20 mt-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-400 transition-all duration-100 ease-out"
            style={{ width: `${energy * 100}%` }}
          />
        </div>
      </div>

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
