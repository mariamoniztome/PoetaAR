import { AudioExperience } from '../components/AudioExperience';
import { CameraBackground } from '../components/CameraBackground';
import { SOUND_PATHS } from '../constants/assets';
import { Scene2Background } from './components/Scene2Background';
import { HibiscusAnchor } from './components/HibiscusAnchor';

export default function Scene2() {
  return (
    <div className="w-full h-full bg-black relative overflow-hidden font-sans">
      {/* Layer 0: live camera feed */}
      <CameraBackground />

      {/* Layer 1: audio controls */}
      <AudioExperience
        backgroundUrl={SOUND_PATHS.FIELD_BG}
        narrationUrl={SOUND_PATHS.FIELD_NARRATION}
      />

      {/* Layer 2: fixed R3F background — ground + grass + plants (does NOT track marker) */}
      <Scene2Background />

      {/* Layer 3: MindAR — only the hibiscus tracks the marker */}
      <HibiscusAnchor />
    </div>
  );
}
