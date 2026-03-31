import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

export function FloatingObject({ modelUrl }: { modelUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const energy = useStore.getState().energy;
    const baseHeight = Math.sin(t * 0.5) * (0.5 + energy * 1.5) * 0.5;
    const detailHeight = Math.sin(t * 1.2) * (0.1 + energy * 0.5) * 0.5;
    const targetY = baseHeight + detailHeight - 1.2;
    const targetRotX = Math.sin(t * 0.8) * (0.1 + energy * 0.3);
    const targetRotZ = Math.cos(t * 0.6) * (0.1 + energy * 0.3);

    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 0.05);
  });

  return (
    <group ref={groupRef}>
      {modelUrl ? <Model url={modelUrl} /> : <PlaceholderBoat />}
    </group>
  );
}

function PlaceholderBoat() {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1, 0.5, 2]} />
      <meshStandardMaterial color="#8B4513" roughness={0.8} />
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
    </mesh>
  );
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}
