import { Canvas } from '@react-three/fiber';
import { Background } from './components/Background';
import { Anchor } from './components/Anchor';
import { AudioExperience } from '../components/ui/AudioExperience';
import { CameraBackground } from '../components/ui/CameraBackground';
import { SOUND_PATHS } from '../constants/assets';

export default function Scene1() {
  return (
    <div className="w-full h-full bg-black relative overflow-hidden font-sans">
      <CameraBackground />
      <AudioExperience backgroundUrl={SOUND_PATHS.SEA_BG} narrationUrl={SOUND_PATHS.SEA_NARRATION} />
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 60 }} gl={{ alpha: true, antialias: true }} className="z-10">
        <Background />
      </Canvas>
      <Anchor />
    </div>
  );
}
