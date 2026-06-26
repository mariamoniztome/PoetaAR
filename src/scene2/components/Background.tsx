import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { MODEL_PATHS } from '../../constants/assets';
import { MotionControllerSafe } from '../../components/ar/MotionControllerSafe';

const CFG = {
  camX: 1.65, camY: -2.00, camZ: 8.9, camFov: 34,
  groundSize: 40, groundY: -2.55, groundOpacity: 0.14,
  geoCount: 60, geoRadius: 3, geoScaleMin: 0.3, geoScaleMax: 0.9, geoYOffset: 0, geoCurvature: 0,
  glbGrassCount: 18, glbGrassRadius: 2.5, glbGrassScaleMin: 0.3, glbGrassScaleMax: 0.6, glbGrassYOffset: 0, glbGrassCurvature: 0,
  ivyCount: 20, leopardCount: 20, cloverCount: 30,
  plantRadius: 5.6, plantScaleMin: 2.0, plantScaleMax: 2.0, plantYOffset: 0.10,
};

interface Pos { x: number; y: number; z: number; ry: number; scale: number; }

function makePos(count: number, radius: number, scaleMin: number, scaleMax: number, groundY: number, relYOffset: number, curvature = 0): Pos[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    return {
      x: Math.cos(angle) * r,
      y: groundY + relYOffset + curvature * r * r,
      z: Math.sin(angle) * r,
      ry: Math.random() * Math.PI * 2,
      scale: scaleMin + Math.random() * Math.max(scaleMax - scaleMin, 0),
    };
  });
}

function CameraController() {
  const { camera } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(CFG.camX, CFG.camY, CFG.camZ);
    cam.fov = CFG.camFov;
    cam.updateProjectionMatrix();
    cam.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CFG.groundY, 0]} scale={[CFG.groundSize, CFG.groundSize, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color="#6b7866" roughness={1} transparent opacity={CFG.groundOpacity} depthWrite={false} />
    </mesh>
  );
}

function GlbScatter({ url, positions, animated = false }: { url: string; positions: Pos[]; animated?: boolean }) {
  const { scene } = useGLTF(url);
  const clones = useMemo(() => positions.map((p) => {
    const clone = scene.clone(true);
    clone.rotation.y = p.ry;
    return clone;
  }), [scene, positions]);
  const phases = useMemo(() => positions.map(() => Math.random() * Math.PI * 2), [positions]);

  useFrame(({ clock }) => {
    if (!animated) return;
    const t = clock.getElapsedTime();
    const energy = useStore.getState().energy;
    const amp = 0.04 + energy * 0.14;
    clones.forEach((clone, i) => {
      clone.rotation.z = Math.sin(t * 0.9 + phases[i]) * amp;
      clone.rotation.x = Math.sin(t * 0.6 + phases[i] + 1.5) * amp * 0.5;
    });
  });

  return (
    <>
      {clones.map((clone, i) => (
        <primitive key={i} object={clone}
          position={[positions[i].x, positions[i].y, positions[i].z]}
          scale={positions[i].scale}
        />
      ))}
    </>
  );
}

function WildFlower({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATHS.FLOWER);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const speed = useMemo(() => 0.5 + Math.random() * 0.5, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const { energy, config } = useStore.getState();
    const windStrength = config.windBaseStrength + energy * config.windEnergyStrength;
    const windSpeed = speed + energy * config.windEnergySpeedBoost;
    const swayZ = Math.sin(t * windSpeed + offset) * windStrength;
    const swayZ2 = Math.sin(t * windSpeed * 2.3 + offset + 1.1) * windStrength * 0.3;
    const swayX = Math.sin(t * windSpeed * 0.7 + offset + 0.5) * windStrength * 0.4;
    meshRef.current.rotation.z = swayZ + swayZ2;
    meshRef.current.rotation.x = swayX;
  });

  return (
    <group position={position} ref={meshRef}>
      <primitive object={clonedScene} scale={useStore.getState().config.flowerScale} />
    </group>
  );
}

export function Background() {
  const config = useStore((state) => state.config);
  const addEnergy = useStore((state) => state.addEnergy);
  const updateEnergy = useStore((state) => state.updateEnergy);

  const glbGrassPos = useMemo(() => makePos(CFG.glbGrassCount, CFG.glbGrassRadius, CFG.glbGrassScaleMin, CFG.glbGrassScaleMax, CFG.groundY, CFG.glbGrassYOffset, CFG.glbGrassCurvature), []);
  const ivyPos      = useMemo(() => makePos(CFG.ivyCount,      CFG.plantRadius,    CFG.plantScaleMin,    CFG.plantScaleMax,    CFG.groundY, CFG.plantYOffset), []);
  const leopardPos  = useMemo(() => makePos(CFG.leopardCount,  CFG.plantRadius,    CFG.plantScaleMin,    CFG.plantScaleMax,    CFG.groundY, CFG.plantYOffset), []);
  const cloverPos   = useMemo(() => makePos(CFG.cloverCount,   CFG.plantRadius,    CFG.plantScaleMin,    CFG.plantScaleMax,    CFG.groundY, CFG.plantYOffset), []);

  const flowers = useMemo(() => {
    const f: { position: [number, number, number] }[] = [];
    for (let i = 0; i < config.flowerCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * config.flowerFieldRadius;
      f.push({ position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] });
    }
    return f;
  }, [config.flowerCount, config.flowerFieldRadius]);

  return (
    <>
      <MotionControllerSafe addEnergy={addEnergy} updateEnergy={updateEnergy} />
      <CameraController />
      <ambientLight intensity={config.ambientLightIntensity} />
      <directionalLight position={config.directionalLightPosition} intensity={config.directionalLightIntensity} color={config.directionalLightColor} />

      <Ground />
      <GlbScatter url={MODEL_PATHS.GRASS}         positions={glbGrassPos} />
      <GlbScatter url={MODEL_PATHS.IVY}           positions={ivyPos}     animated />
      <GlbScatter url={MODEL_PATHS.LEOPARD_PLANT} positions={leopardPos} animated />
      <GlbScatter url={MODEL_PATHS.WHITE_CLOVER}  positions={cloverPos}  animated />

      {flowers.map((f, i) => (
        <WildFlower key={i} position={f.position} />
      ))}
    </>
  );
}

useGLTF.preload(MODEL_PATHS.GRASS);
useGLTF.preload(MODEL_PATHS.IVY);
useGLTF.preload(MODEL_PATHS.LEOPARD_PLANT);
useGLTF.preload(MODEL_PATHS.WHITE_CLOVER);
useGLTF.preload(MODEL_PATHS.FLOWER);
