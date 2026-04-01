import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { MODEL_PATHS } from '../../constants/assets';

export function Bird({ index, total }: { index: number, total: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Load the model
  const { scene, animations } = useGLTF(MODEL_PATHS.BIRD);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { actions } = useAnimations(animations, meshRef);

  // Play animation if it exists
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.play();
      }
    }
  }, [actions]);

  // Random offsets for natural variety
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const speed = useMemo(() => 0.8 + Math.random() * 0.4, []);
  
  // Initial position in a flock formation
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
    if (!meshRef.current) return;
    
    const t = state.clock.elapsedTime;
    const energy = useStore.getState().energy;

    // 1. Calculate target position
    const baseNoise = 0.2;
    const stormyNoise = energy * 5.0; 
    
    targetPos.current.set(
      initialPos.x + Math.sin(t * speed + noiseOffset.x * 10) * (baseNoise + stormyNoise),
      initialPos.y + Math.cos(t * speed * 0.8 + noiseOffset.y * 10) * (baseNoise + stormyNoise),
      initialPos.z + Math.sin(t * speed * 1.2 + noiseOffset.z * 10) * (baseNoise + stormyNoise)
    );

    // 2. Smoothly move towards target
    const lerpSpeed = energy > 0.5 ? 0.02 : 0.05;
    currentPos.current.lerp(targetPos.current, lerpSpeed);
    meshRef.current.position.copy(currentPos.current);

    // 3. Look at direction of travel
    const velocity = targetPos.current.clone().sub(currentPos.current);
    if (velocity.length() > 0.01) {
      const lookTarget = currentPos.current.clone().add(velocity.normalize().multiplyScalar(2));
      meshRef.current.lookAt(lookTarget);
    }

    // 4. Adjust animation speed based on energy if applicable
    if (actions && Object.values(actions)[0]) {
      const action = Object.values(actions)[0];
      if (action) {
        action.timeScale = 1 + energy * 2;
      }
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={clonedScene} scale={0.5} />
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

useGLTF.preload(MODEL_PATHS.BIRD);
