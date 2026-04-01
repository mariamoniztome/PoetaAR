import { Suspense } from 'react';
import { Meadow } from './Meadow';
import { MotionController } from './MotionController';
import { useStore } from '../store';

export function ARScene() {
  const debugConfig = useStore((state) => state.debugConfig);

  return (
    <>
      <MotionController />

      <ambientLight intensity={debugConfig.ambientLightIntensity} />
      <directionalLight
        position={debugConfig.directionalLightPosition}
        intensity={debugConfig.directionalLightIntensity}
        color={debugConfig.directionalLightColor}
      />

      <Suspense fallback={null}>
        <Meadow />
      </Suspense>
    </>
  );
}
