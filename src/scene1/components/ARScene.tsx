import { Suspense } from 'react';
import { Environment, Sky } from '@react-three/drei';
import { Ocean } from './Ocean';
import { FloatingObject } from './FloatingObject';
import { MotionController } from './MotionController';
import { useXR } from '@react-three/xr';

export function ARScene({ modelUrl }: { modelUrl?: string }) {
  const isPresenting = useXR((state) => state.session);

  return (
    <>
      <MotionController />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow color="#ffeedd" />
      
      {!isPresenting && (
        <>
          <Sky distance={450000} sunPosition={[10, 2, 5]} inclination={0.49} azimuth={0.25} turbidity={10} rayleigh={2} />
          <Environment preset="sunset" />
          <Ocean />
          <fog attach="fog" args={['#87CEEB', 10, 40]} />
        </>
      )}

      <Suspense fallback={null}>
        <FloatingObject modelUrl={modelUrl} />
      </Suspense>
    </>
  );
}
