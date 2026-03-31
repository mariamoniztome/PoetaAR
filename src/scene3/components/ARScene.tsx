import { Suspense } from 'react';
import { Clouds, Cloud } from '@react-three/drei';
import { Flock } from './Flock';
import { MotionController } from './MotionController';
import * as THREE from 'three';

export function ARScene() {
  return (
    <>
      <MotionController />
      
      {/* Lighting for a bright day in the sky */}
      <ambientLight intensity={1.0} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.5} 
        castShadow 
      />
      
      <Suspense fallback={null}>
        <Flock />
        
        {/* Cinematic clouds floating in your room */}
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
        </Clouds>
      </Suspense>
    </>
  );
}
