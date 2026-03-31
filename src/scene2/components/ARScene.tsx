import { Suspense } from 'react';
import { Environment, Sky, ContactShadows } from '@react-three/drei';
import { Meadow } from './Meadow';
import { MotionController } from './MotionController';
import { useXR } from '@react-three/xr';

export function ARScene() {
  const isPresenting = useXR((state) => state.session);

  return (
    <>
      <MotionController />
      
      {/* Lighting for a sunny day in the field */}
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        castShadow 
      />
      
      {!isPresenting && (
        <>
          <Sky 
            distance={450000} 
            sunPosition={[5, 1, 8]} 
            inclination={0.6} 
            azimuth={0.1} 
            turbidity={0.1}
            rayleigh={0.5}
          />
          <Environment preset="park" />
          <fog attach="fog" args={['#e3f2fd', 5, 30]} />
        </>
      )}

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
