import { Suspense } from 'react';
import { Ocean } from './Ocean';
import { FloatingObject } from './FloatingObject';
import { MotionControllerSafe } from './MotionControllerSafe';
import { MODEL_PATHS } from '../../constants/assets';
import { useStore } from '../store';

export function ARScene({ modelUrl = MODEL_PATHS.FLOATING_OBJECT }: { modelUrl?: string }) {
  const debugConfig = useStore((state) => state.debugConfig);

  return (
    <>
      <MotionControllerSafe />
      <ambientLight intensity={debugConfig.ambientLightIntensity} />
      <directionalLight
        position={debugConfig.directionalLightPosition}
        intensity={debugConfig.directionalLightIntensity}
        castShadow
        color={debugConfig.directionalLightColor}
      />

      <Suspense fallback={null}>
        <Ocean />
        {/* FloatingObject comentado — farol só via âncora AR
        {Array.from({ length: debugConfig.objectCount }).map((_, index) => {
          const angle = (index / Math.max(debugConfig.objectCount, 1)) * Math.PI * 2;
          const radius = debugConfig.objectCount <= 1 ? 0 : debugConfig.objectSpread;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <group key={index} position={[x, 0, z]}>
              <FloatingObject modelUrl={modelUrl} />
            </group>
          );
        })}
        */}
      </Suspense>
    </>
  );
}
