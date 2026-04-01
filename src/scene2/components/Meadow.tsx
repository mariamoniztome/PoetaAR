import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { MODEL_PATHS } from '../../constants/assets';

export function WildFlower({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATHS.FLOWER);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const speed = useMemo(() => 0.5 + Math.random() * 0.5, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.elapsedTime;
    const { energy, debugConfig } = useStore.getState();

    const windStrength = debugConfig.windBaseStrength + energy * debugConfig.windEnergyStrength;
    const windSpeed = speed + energy * debugConfig.windEnergySpeedBoost;

    const swayX = Math.sin(t * windSpeed + offset) * windStrength;
    const swayZ = Math.cos(t * windSpeed * 0.8 + offset) * windStrength;

    meshRef.current.rotation.x = swayX;
    meshRef.current.rotation.z = swayZ;
  });

  return (
    <group position={position} ref={meshRef}>
      <primitive object={clonedScene} scale={useStore.getState().debugConfig.flowerScale} />
    </group>
  );
}

export function Grass({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: number;
  scale: number;
}) {
  const { scene } = useGLTF(MODEL_PATHS.GRASS);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <primitive object={clonedScene} position={position} rotation={[0, rotation, 0]} scale={scale} />
  );
}

export function Meadow() {
  const debugConfig = useStore((state) => state.debugConfig);

  const { flowers, grassPatches } = useMemo(() => {
    const f: { position: [number, number, number]; color: string }[] = [];
    const g: { position: [number, number, number]; rotation: number; scale: number }[] = [];
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];

    for (let i = 0; i < debugConfig.flowerCount; i++) {
      const x = (Math.random() - 0.5) * debugConfig.flowerFieldRadius;
      const z = (Math.random() - 0.5) * debugConfig.flowerFieldRadius;
      const color = colors[Math.floor(Math.random() * colors.length)];
      f.push({ position: [x, -1.5, z], color });
    }

    for (let i = 0; i < debugConfig.grassCount; i++) {
      const x = (Math.random() - 0.5) * debugConfig.grassFieldRadius;
      const z = (Math.random() - 0.5) * debugConfig.grassFieldRadius;
      const rotation = Math.random() * Math.PI * 2;
      const scale =
        debugConfig.grassScaleMin +
        Math.random() * Math.max(debugConfig.grassScaleMax - debugConfig.grassScaleMin, 0);

      g.push({ position: [x, -1.5, z], rotation, scale });
    }

    return { flowers: f, grassPatches: g };
  }, [
    debugConfig.flowerCount,
    debugConfig.grassCount,
    debugConfig.flowerFieldRadius,
    debugConfig.grassFieldRadius,
    debugConfig.grassScaleMin,
    debugConfig.grassScaleMax,
  ]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.51, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={debugConfig.groundColor} transparent opacity={debugConfig.groundOpacity} />
      </mesh>

      {grassPatches.map((g, i) => (
        <Grass key={`grass-${i}`} position={g.position} rotation={g.rotation} scale={g.scale} />
      ))}

      {flowers.map((f, i) => (
        <WildFlower key={`flower-${i}`} position={f.position} color={f.color} />
      ))}
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.FLOWER);
useGLTF.preload(MODEL_PATHS.GRASS);
