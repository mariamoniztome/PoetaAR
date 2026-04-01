import { Suspense, useMemo } from 'react';
import { Clouds, Cloud, useGLTF } from '@react-three/drei';
import { Flock } from './Flock';
import { MotionController } from './MotionController';
import * as THREE from 'three';
import { MODEL_PATHS } from '../../constants/assets';

function CustomCloud({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const { scene } = useGLTF(MODEL_PATHS.CLOUD);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      scale={scale} 
    />
  );
}

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
        
        {/* Custom 3D Clouds */}
        <CustomCloud position={[-5, 2, -12]} scale={2} />
        <CustomCloud position={[8, 0, -15]} scale={1.5} />
        <CustomCloud position={[0, 4, -20]} scale={3} />

        {/* Procedural clouds as background depth */}
        <Clouds material={THREE.MeshStandardMaterial}>
          <Cloud 
            segments={20} 
            bounds={[10, 2, 10]} 
            volume={6} 
            color="#ffffff" 
            position={[0, -2, -10]} 
            speed={0.1}
            opacity={0.3}
          />
        </Clouds>
      </Suspense>
    </>
  );
}

useGLTF.preload(MODEL_PATHS.CLOUD);
