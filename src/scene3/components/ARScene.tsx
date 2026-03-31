import { Suspense } from 'react';
import { Environment, Sky, Clouds, Cloud } from '@react-three/drei';
import { Flock } from './Flock';
import { MotionController } from './MotionController';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';

export function ARScene() {
  const isPresenting = useXR((state) => state.session);

  return (
    <>
      <MotionController />
      
      {/* Lighting for a bright day in the sky */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.5} 
        castShadow 
      />
      
      {!isPresenting && (
        <>
          <Sky 
            distance={450000} 
            sunPosition={[5, 1, 8]} 
            inclination={0.6} 
            azimuth={0.1} 
            turbidity={0.01}
            rayleigh={0.1}
          />
          <Environment preset="night" />
          <Clouds material={THREE.MeshStandardMaterial}>
            <Cloud 
              segments={20} 
              bounds={[10, 2, 10]} 
              volume={6} 
              color="#ffffff" 
              position={[0, -2, -10]} 
              speed={0.1}
              opacity={0.5}
            />
            <Cloud 
              segments={15} 
              bounds={[10, 2, 10]} 
              volume={5} 
              color="#f0f8ff" 
              position={[10, 2, -15]} 
              speed={0.2}
              opacity={0.4}
            />
            <Cloud 
              segments={15} 
              bounds={[10, 2, 10]} 
              volume={5} 
              color="#ffffff" 
              position={[-10, 1, -12]} 
              speed={0.15}
              opacity={0.6}
            />
          </Clouds>
          <fog attach="fog" args={['#87CEEB', 10, 50]} />
        </>
      )}

      <Suspense fallback={null}>
        <Flock />
      </Suspense>
    </>
  );
}
