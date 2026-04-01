import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { MODEL_PATHS } from '../../constants/assets';

export function WildFlower({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Load the model
  // Note: If the model doesn't exist yet, this will wait for Suspense
  const { scene } = useGLTF(MODEL_PATHS.FLOWER);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Random offset for natural variety
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const speed = useMemo(() => 0.5 + Math.random() * 0.5, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const energy = useStore.getState().energy;
    
    // Wind effect: base gentle breeze + user energy (stormy wind)
    const windStrength = 0.1 + energy * 1.5;
    const windSpeed = speed + energy * 2.0;
    
    // Swaying motion
    const swayX = Math.sin(t * windSpeed + offset) * windStrength;
    const swayZ = Math.cos(t * windSpeed * 0.8 + offset) * windStrength;
    
    meshRef.current.rotation.x = swayX;
    meshRef.current.rotation.z = swayZ;
  });

  return (
    <group position={position} ref={meshRef}>
      {/* If you want to color the model dynamically, you can traverse it here */}
      <primitive object={clonedScene} />
    </group>
  );
}

export function Grass({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(MODEL_PATHS.GRASS);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const rotation = useMemo(() => Math.random() * Math.PI * 2, []);
  const scale = useMemo(() => 0.8 + Math.random() * 0.4, []);

  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      rotation={[0, rotation, 0]} 
      scale={scale} 
    />
  );
}

export function Meadow() {
  const { flowers, grassPatches } = useMemo(() => {
    const f = [];
    const g = [];
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];
    
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      const color = colors[Math.floor(Math.random() * colors.length)];
      f.push({ position: [x, -1.5, z] as [number, number, number], color });
    }

    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 15;
      g.push({ position: [x, -1.5, z] as [number, number, number] });
    }

    return { flowers: f, grassPatches: g };
  }, []);

  return (
    <group>
      {/* Ground (Grass Plane) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.51, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a3c15" transparent opacity={0.7} />
      </mesh>
      
      {/* Grass Models */}
      {grassPatches.map((g, i) => (
        <Grass key={`grass-${i}`} position={g.position} />
      ))}

      {/* Flowers */}
      {flowers.map((f, i) => (
        <WildFlower key={`flower-${i}`} position={f.position} color={f.color} />
      ))}
    </group>
  );
}

// Preload models
useGLTF.preload(MODEL_PATHS.FLOWER);
useGLTF.preload(MODEL_PATHS.GRASS);
