import { memo, Suspense, useMemo, useRef } from 'react';
import { Clouds, Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MotionControllerSafe } from './MotionControllerSafe';
import * as THREE from 'three';
import { useStore } from '../store';

function ProceduralCloudField() {
  const debugConfig = useStore((state) => state.debugConfig);
  const cloudRefs = useRef<Array<THREE.Group | null>>([]);
  const cloudTimeRef = useRef(0);

  const hash01 = (seed: number) => {
    const x = Math.sin(seed * 127.1) * 43758.5453123;
    return x - Math.floor(x);
  };

  const cloudSeeds = useMemo(
    () =>
      Array.from({ length: debugConfig.cloudCount }).map((_, index) => ({
        baseX: -10 + index * 5,
        baseY: 3.5 + (index % 3) * 1.0,
        baseZ: -14 - index * 2.0,
        phase: hash01(index + 1) * Math.PI * 2,
        speedFactor: 0.8 + hash01(index + 101) * 0.6,
        volume: 4 + hash01(index + 1001) * 3,
      })),
    [debugConfig.cloudCount]
  );

  useFrame((_, delta) => {
    const liveConfig = useStore.getState().debugConfig;
    const clampedDelta = Math.min(delta, 1 / 30);
    cloudTimeRef.current += clampedDelta;

    const t = cloudTimeRef.current;
    const angle = (liveConfig.cloudMoveDirectionDeg * Math.PI) / 180;
    const dirX = Math.cos(angle);
    const dirZ = Math.sin(angle);
    const shouldMove =
      liveConfig.cloudMotionEnabled &&
      liveConfig.cloudMoveSpeed > 0.0001 &&
      liveConfig.cloudMoveAmplitude > 0.0001;

    for (let i = 0; i < cloudSeeds.length; i++) {
      const node = cloudRefs.current[i];
      if (!node) continue;

      const seed = cloudSeeds[i];
      if (!shouldMove) {
        node.position.x = seed.baseX;
        node.position.y = seed.baseY;
        node.position.z = seed.baseZ;
        continue;
      }

      const offset =
        Math.sin(t * liveConfig.cloudMoveSpeed * seed.speedFactor + seed.phase) *
        liveConfig.cloudMoveAmplitude;

      node.position.x = seed.baseX + dirX * offset;
      node.position.y = seed.baseY;
      node.position.z = seed.baseZ + dirZ * offset;
    }
  });

  return (
    <Clouds material={THREE.MeshStandardMaterial}>
      {cloudSeeds.map((seed, index) => (
        <group
          key={index}
          ref={(node) => {
            cloudRefs.current[index] = node;
          }}
          position={[seed.baseX, seed.baseY, seed.baseZ]}
        >
          <Cloud
            segments={35}
            bounds={[
              10 * debugConfig.cloudScaleMultiplier,
              2 * debugConfig.cloudScaleMultiplier,
              10 * debugConfig.cloudScaleMultiplier,
            ]}
            volume={seed.volume * debugConfig.cloudScaleMultiplier}
            color={debugConfig.proceduralCloudColor}
            speed={0}
            opacity={debugConfig.proceduralCloudOpacity}
          />
        </group>
      ))}
    </Clouds>
  );
}

export const ARScene = memo(function ARScene() {
  const debugConfig = useStore((state) => state.debugConfig);

  return (
    <>
      <MotionControllerSafe />

      <ambientLight intensity={debugConfig.ambientLightIntensity} />
      <directionalLight
        position={debugConfig.directionalLightPosition}
        intensity={debugConfig.directionalLightIntensity}
        color={debugConfig.directionalLightColor}
        castShadow
      />

      <Suspense fallback={null}>
        <ProceduralCloudField />
      </Suspense>
    </>
  );
});
