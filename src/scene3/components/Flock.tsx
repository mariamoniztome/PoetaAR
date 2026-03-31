import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

export function Bird({ index, total }: { index: number, total: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Mesh>(null);
  const wingRightRef = useRef<THREE.Mesh>(null);

  // Random offsets for natural variety
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const speed = useMemo(() => 0.8 + Math.random() * 0.4, []);
  
  // Initial position in a flock formation (V-shape or sphere)
  const initialPos = useMemo(() => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 2 + Math.random();
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.5,
      (Math.random() - 0.5) * 2
    );
  }, [index, total]);

  const currentPos = useRef(new THREE.Vector3().copy(initialPos));
  const targetPos = useRef(new THREE.Vector3().copy(initialPos));
  const noiseOffset = useMemo(() => new THREE.Vector3(Math.random(), Math.random(), Math.random()), []);

  useFrame((state) => {
    if (!meshRef.current || !wingLeftRef.current || !wingRightRef.current) return;
    
    const t = state.clock.elapsedTime;
    const energy = useStore.getState().energy;

    // 1. Calculate target position
    // Base flocking position + some noise
    const baseNoise = 0.2;
    const stormyNoise = energy * 5.0; // Scatter birds when energy is high
    
    targetPos.current.set(
      initialPos.x + Math.sin(t * speed + noiseOffset.x * 10) * (baseNoise + stormyNoise),
      initialPos.y + Math.cos(t * speed * 0.8 + noiseOffset.y * 10) * (baseNoise + stormyNoise),
      initialPos.z + Math.sin(t * speed * 1.2 + noiseOffset.z * 10) * (baseNoise + stormyNoise)
    );

    // 2. Smoothly move towards target (inertia/weight)
    const lerpSpeed = energy > 0.5 ? 0.02 : 0.05; // Slower reorganization
    currentPos.current.lerp(targetPos.current, lerpSpeed);
    meshRef.current.position.copy(currentPos.current);

    // 3. Flapping animation
    const flapSpeed = 5 + energy * 15;
    const flapAngle = Math.sin(t * flapSpeed + offset) * (0.4 + energy * 0.4);
    wingLeftRef.current.rotation.z = flapAngle;
    wingRightRef.current.rotation.z = -flapAngle;

    // 4. Look at direction of travel (simplified)
    const velocity = targetPos.current.clone().sub(currentPos.current);
    if (velocity.length() > 0.01) {
      const lookTarget = currentPos.current.clone().add(velocity.normalize().multiplyScalar(2));
      meshRef.current.lookAt(lookTarget);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh>
        <coneGeometry args={[0.05, 0.2, 4]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Wings */}
      <mesh ref={wingLeftRef} position={[-0.05, 0, 0]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshStandardMaterial color="#555" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wingRightRef} position={[0.05, 0, 0]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshStandardMaterial color="#555" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Flock() {
  const birdCount = 25;
  return (
    <group position={[0, 0, -5]}>
      {Array.from({ length: birdCount }).map((_, i) => (
        <Bird key={i} index={i} total={birdCount} />
      ))}
    </group>
  );
}
