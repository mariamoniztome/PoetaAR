import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

export function WildFlower({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const stemRef = useRef<THREE.Mesh>(null);
  
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
      {/* Stem */}
      <mesh position={[0, 0.5, 0]} ref={stemRef}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      
      {/* Flower Head (Placeholder) */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      
      {/* Petals (Simple representation) */}
      <group position={[0, 1, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI * 2) / 5, 0.5]}>
            <planeGeometry args={[0.2, 0.4]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Meadow() {
  const flowers = useMemo(() => {
    const temp = [];
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      const color = colors[Math.floor(Math.random() * colors.length)];
      temp.push({ position: [x, -1.5, z] as [number, number, number], color });
    }
    return temp;
  }, []);

  return (
    <group>
      {/* Ground (Grass) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.51, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a3c15" transparent opacity={0.7} />
      </mesh>
      
      {/* Flowers */}
      {flowers.map((f, i) => (
        <WildFlower key={i} position={f.position} color={f.color} />
      ))}
    </group>
  );
}
