import { Canvas } from '@react-three/fiber';
import { ARScene } from './components/ARScene';
import { useStore } from './store';
import { MusicPlayer } from '../components/MusicPlayer';
import { CameraBackground } from '../components/CameraBackground';

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

      {/* Music Player for Scene 1 */}
      <MusicPlayer url="https://assets.mixkit.co/music/preview/mixkit-ocean-ambient-loop-123.mp3" />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex flex-col items-center justify-center text-white text-center">
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2 drop-shadow-lg">
          {title}
        </h1>
        <p className="text-sm opacity-80 max-w-md drop-shadow-md">
          {description}
        </p>
        
        {/* Energy Bar Indicator */}
        <div className="w-48 h-1 bg-white/20 mt-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-400 transition-all duration-100 ease-out"
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
        <ARScene modelUrl={modelUrl} />
      </Canvas>
    </div>
  );
}
