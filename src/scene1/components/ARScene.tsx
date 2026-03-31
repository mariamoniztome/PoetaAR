import { Suspense } from 'react';
import { Ocean } from './Ocean';
import { FloatingObject } from './FloatingObject';
import { MotionController } from './MotionController';

export function ARScene({ modelUrl }: { modelUrl?: string }) {
  return (
    <>
      <MotionController />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow color="#ffffff" />
      
      <Suspense fallback={null}>
        <Ocean />
        <FloatingObject modelUrl={modelUrl} />
      </Suspense>
    </>
  );
}
