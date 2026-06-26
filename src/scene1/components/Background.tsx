import { Suspense } from 'react';
import { Ocean } from './Ocean';
import { MotionControllerSafe } from '../../components/ar/MotionControllerSafe';
import { useStore } from '../store';

export function Background({ modelUrl }: { modelUrl?: string }) {
  const config = useStore((state) => state.config);
  const addEnergy = useStore((state) => state.addEnergy);
  const updateEnergy = useStore((state) => state.updateEnergy);

  return (
    <>
      <MotionControllerSafe addEnergy={addEnergy} updateEnergy={updateEnergy} />
      <ambientLight intensity={config.ambientLightIntensity} />
      <directionalLight
        position={config.directionalLightPosition}
        intensity={config.directionalLightIntensity}
        castShadow
        color={config.directionalLightColor}
      />
      <Suspense fallback={null}>
        <Ocean />
      </Suspense>
    </>
  );
}
