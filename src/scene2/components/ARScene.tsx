import { Suspense } from 'react';
import { ContactShadows } from '@react-three/drei';
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
        castShadow
      />

      <Suspense fallback={null}>
        <Meadow />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      </Suspense>
    </>
  );
}
