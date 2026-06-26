import { Canvas } from '@react-three/fiber';
import { Background } from './components/Background';
import { Anchor } from './components/Anchor';
import { AudioExperience } from '../components/ui/AudioExperience';
import { CameraBackground } from '../components/ui/CameraBackground';
import { SOUND_PATHS } from '../constants/assets';

export default function Scene2() {
  return (
    <div className="w-full h-full bg-black relative overflow-hidden font-sans">
      <CameraBackground />
      <AudioExperience backgroundUrl={SOUND_PATHS.FIELD_BG} narrationUrl={SOUND_PATHS.FIELD_NARRATION} />
      <Canvas camera={{ position: [1.65, -2.00, 8.9], fov: 34 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} className="z-10" style={{ position: 'absolute', inset: 0 }}>
        <Background />
      </Canvas>
      <Anchor />
    </div>
  );
}
