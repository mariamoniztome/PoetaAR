import { memo, Suspense, useMemo, useRef } from 'react';
import { Clouds, Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MotionControllerSafe } from '../../components/ar/MotionControllerSafe';
import * as THREE from 'three';
import { useStore } from '../store';

function ProceduralCloudField() {
  const config = useStore((state) => state.config);
  const cloudRefs = useRef<Array<THREE.Group | null>>([]);
  const cloudTimeRef = useRef(0);
  const driveRef = useRef(0);

  const hash01 = (seed: number) => {
    const x = Math.sin(seed * 127.1) * 43758.5453123;
    return x - Math.floor(x);
  };

  const cloudSeeds = useMemo(
    () =>
      Array.from({ length: config.cloudCount }).map((_, index) => ({
        baseX: -10 + index * 5,
        baseY: 3.5 + (index % 3) * 1.0,
        baseZ: -14 - index * 2.0,
        phase: hash01(index + 1) * Math.PI * 2,
        speedFactor: 0.6 + hash01(index + 101) * 0.8,
        bobPhase: hash01(index + 201) * Math.PI * 2,
        bobSpeed: 0.2 + hash01(index + 301) * 0.3,
        volume: 4 + hash01(index + 1001) * 3,
      })),
    [config.cloudCount]
  );

  useFrame((_, delta) => {
    const liveConfig = useStore.getState().config;
    const energy = useStore.getState().energy;
    const clampedDelta = Math.min(delta, 1 / 30);

    const energyBoost = 1 + energy * liveConfig.animationEnergyBoost;
    driveRef.current += clampedDelta * liveConfig.cloudMoveSpeed * energyBoost;
    cloudTimeRef.current += clampedDelta;

    const drive = driveRef.current;
    const tBob = cloudTimeRef.current;
    const angle = (liveConfig.cloudMoveDirectionDeg * Math.PI) / 180;
    const dirX = Math.cos(angle);
    const dirZ = Math.sin(angle);
    const range = liveConfig.cloudMoveAmplitude * 2;

    for (let i = 0; i < cloudSeeds.length; i++) {
      const node = cloudRefs.current[i];
      if (!node) continue;

      const seed = cloudSeeds[i];

      if (!liveConfig.cloudMotionEnabled) {
        node.position.set(seed.baseX, seed.baseY, seed.baseZ);
        continue;
      }

      const raw = drive * seed.speedFactor + seed.phase * liveConfig.cloudMoveAmplitude;
      const drift = ((raw % range) + range) % range - liveConfig.cloudMoveAmplitude;
      const bob = Math.sin(tBob * seed.bobSpeed + seed.bobPhase) * (0.5 + energy * 1.2);

      node.position.x = seed.baseX + dirX * drift;
      node.position.y = seed.baseY + bob;
      node.position.z = seed.baseZ + dirZ * drift;
    }
  });

  return (
    <Clouds material={THREE.MeshStandardMaterial}>
      {cloudSeeds.map((seed, index) => (
        <group
          key={index}
          ref={(node) => { cloudRefs.current[index] = node; }}
          position={[seed.baseX, seed.baseY, seed.baseZ]}
        >
          <Cloud
            segments={35}
            bounds={[
              10 * config.cloudScaleMultiplier,
              2 * config.cloudScaleMultiplier,
              10 * config.cloudScaleMultiplier,
            ]}
            volume={seed.volume * config.cloudScaleMultiplier}
            color={config.proceduralCloudColor}
            speed={0}
            opacity={config.proceduralCloudOpacity}
          />
        </group>
      ))}
    </Clouds>
  );
}

export const Background = memo(function Background() {
  const config = useStore((state) => state.config);
  const addEnergy = useStore((state) => state.addEnergy);
  const updateEnergy = useStore((state) => state.updateEnergy);

  return (
    <>
      <MotionControllerSafe addEnergy={addEnergy} updateEnergy={updateEnergy} />
      <ambientLight intensity={config.ambientLightIntensity} />
      <directionalLight
        position={config.directionalLightPosition}
        intensity={config.directionalLightIntensity}
        color={config.directionalLightColor}
        castShadow
      />
      <Suspense fallback={null}>
        <ProceduralCloudField />
      </Suspense>
    </>
  );
});
