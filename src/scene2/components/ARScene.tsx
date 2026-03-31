import { Suspense } from 'react';
import { ContactShadows } from '@react-three/drei';
import { Meadow } from './Meadow';
import { MotionController } from './MotionController';

export function ARScene() {
  return (
    <>
      <MotionController />
      
      {/* Lighting for a sunny day in the field */}
      <ambientLight intensity={1.0} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.5} 
        castShadow 
      />
      
      <Suspense fallback={null}>
        <Meadow />
        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2} 
          far={4.5} 
        />
      </Suspense>
    </>
  );
}
