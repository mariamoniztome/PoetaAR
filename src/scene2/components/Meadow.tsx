import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { MODEL_PATHS } from '../../constants/assets';

export function WildFlower({ position }: { position: [number, number, number] }) {
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

function InstancedGrass({
  count,
  radius,
  scaleMin,
  scaleMax,
}: {
  count: number;
  radius: number;
  scaleMin: number;
  scaleMax: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const transforms = useMemo(
    () =>
      Array.from({ length: count }).map(() => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * radius;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * 0.18;
        const scale = scaleMin + Math.random() * Math.max(scaleMax - scaleMin, 0.001);
        return { x, z, yaw, pitch, scale };
      }),
    [count, radius, scaleMin, scaleMax]
  );

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < transforms.length; i++) {
      const t = transforms[i];
      dummy.position.set(t.x, 0.15 * t.scale, t.z);
      dummy.rotation.set(t.pitch, t.yaw, 0);
      dummy.scale.set(0.1 * t.scale, 0.3 * t.scale, 0.1 * t.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.12, 1.0, 4, 1]} />
      <meshStandardMaterial color="#3f7f2d" roughness={0.95} metalness={0} transparent opacity={0.75} />
    </instancedMesh>
  );
}

export function Meadow() {
  const debugConfig = useStore((state) => state.debugConfig);

  const flowers = useMemo(() => {
    const f: { position: [number, number, number] }[] = [];

    for (let i = 0; i < debugConfig.flowerCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * debugConfig.flowerFieldRadius;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      f.push({ position: [x, 0, z] });
    }

    return f;
  }, [debugConfig.flowerCount, debugConfig.flowerFieldRadius]);

  return (
    <group>
      <InstancedGrass
        count={debugConfig.grassCount}
        radius={debugConfig.grassFieldRadius}
        scaleMin={debugConfig.grassScaleMin}
        scaleMax={debugConfig.grassScaleMax}
      />

      {flowers.map((f, i) => (
        <WildFlower key={`flower-${i}`} position={f.position} />
      ))}
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.FLOWER);
