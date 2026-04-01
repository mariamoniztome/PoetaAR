import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { MODEL_PATHS } from '../../constants/assets';

export function Bird({ index, total }: { index: number; total: number }) {
  const meshRef = useRef<THREE.Group>(null);

  const { scene, animations } = useGLTF(MODEL_PATHS.BIRD);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { actions } = useAnimations(animations, meshRef);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.play();
      }
    }
  }, [actions]);

  const speed = useMemo(() => 0.8 + Math.random() * 0.4, []);

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
    const { energy, debugConfig } = useStore.getState();

    const baseNoise = debugConfig.baseNoise;
    const stormyNoise = energy * debugConfig.stormNoiseMultiplier;

    targetPos.current.set(
      initialPos.x + Math.sin(t * speed + noiseOffset.x * 10) * (baseNoise + stormyNoise),
      initialPos.y + Math.cos(t * speed * 0.8 + noiseOffset.y * 10) * (baseNoise + stormyNoise),
      initialPos.z + Math.sin(t * speed * 1.2 + noiseOffset.z * 10) * (baseNoise + stormyNoise)
    );

    const lerpSpeed = energy > 0.5 ? debugConfig.stormLerpSpeed : debugConfig.baseLerpSpeed;
    currentPos.current.lerp(targetPos.current, lerpSpeed);
    meshRef.current.position.copy(currentPos.current);

    const velocity = targetPos.current.clone().sub(currentPos.current);
    if (velocity.length() > 0.01) {
      const lookTarget = currentPos.current.clone().add(velocity.normalize().multiplyScalar(2));
      meshRef.current.lookAt(lookTarget);
    }

    if (actions && Object.values(actions)[0]) {
      const action = Object.values(actions)[0];
      if (action) {
        action.timeScale = debugConfig.animationBaseSpeed + energy * debugConfig.animationEnergyBoost;
      }
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={clonedScene} scale={useStore.getState().debugConfig.birdScale} />
    </group>
  );
}

export function Flock() {
  const debugConfig = useStore((state) => state.debugConfig);

  return (
    <group position={debugConfig.flockPosition}>
      {Array.from({ length: debugConfig.birdCount }).map((_, i) => (
        <Bird key={i} index={i} total={debugConfig.birdCount} />
      ))}
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.BIRD);
