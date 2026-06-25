import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../../constants/assets';

const SHOW_DEBUG = false;

// ─── Config ───────────────────────────────────────────────────────────────────

interface BgConfig {
  // Camera
  camX: number;
  camY: number;
  camZ: number;
  camFov: number;

  // Ground
  groundSize: number;
  groundY: number;
  groundOpacity: number;

  // Geometric grass (instanced cones)
  geoCount: number;
  geoRadius: number;
  geoScaleMin: number;
  geoScaleMax: number;
  geoYOffset: number;
  geoCurvature: number;

  // grass.glb
  grassCount: number;
  grassRadius: number;
  grassScaleMin: number;
  grassScaleMax: number;
  grassYOffset: number;
  grassCurvature: number;

  // Plants
  ivyCount: number;
  leopardCount: number;
  cloverCount: number;
  plantRadius: number;
  plantScaleMin: number;
  plantScaleMax: number;
  plantYOffset: number;
}

const DEFAULT: BgConfig = {
  camX: 0.75, camY: -0.55, camZ: 8.9, camFov: 40,
  groundSize: 40, groundY: -2.55, groundOpacity: 0.00,
  // Y offsets below are RELATIVE to groundY (0 = on the ground)
  geoCount: 60, geoRadius: 3, geoScaleMin: 0.3, geoScaleMax: 0.9, geoYOffset: 0, geoCurvature: 0,
  grassCount: 20, grassRadius: 2.5, grassScaleMin: 0.3, grassScaleMax: 0.6, grassYOffset: 0, grassCurvature: 0,
  ivyCount: 5, leopardCount: 5, cloverCount: 8,
  plantRadius: 2, plantScaleMin: 0.25, plantScaleMax: 0.5, plantYOffset: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function CameraController({ x, y, z, fov }: { x: number; y: number; z: number; fov: number }) {
  const { camera } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(x, y, z);
    cam.fov = fov;
    cam.updateProjectionMatrix();
    cam.lookAt(0, 0, 0);
  }, [camera, x, y, z, fov]);
  return null;
}

function Ground({ cfg }: { cfg: BgConfig }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useEffect(() => {
    if (matRef.current) matRef.current.opacity = cfg.groundOpacity;
  }, [cfg.groundOpacity]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, cfg.groundY, 0]} scale={[cfg.groundSize, cfg.groundSize, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial ref={matRef} color="#2a5c1a" roughness={1} transparent opacity={cfg.groundOpacity} depthWrite={false} />
    </mesh>
  );
}

function GeoGrass({ frozen, windRef }: { frozen: BgConfig; windRef: React.RefObject<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Store base matrices to apply sway on top each frame
  const baseMats = useRef<THREE.Matrix4[]>([]);
  const phases   = useRef<number[]>([]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    baseMats.current = [];
    phases.current   = [];
    for (let i = 0; i < frozen.geoCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * frozen.geoRadius;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const s = frozen.geoScaleMin + Math.random() * Math.max(frozen.geoScaleMax - frozen.geoScaleMin, 0);
      const y = frozen.groundY + frozen.geoYOffset + frozen.geoCurvature * r * r + 0.45 * 0.3 * s;
      dummy.position.set(x, y, z);
      dummy.rotation.set((Math.random() - 0.5) * 0.2, Math.random() * Math.PI * 2, 0);
      dummy.scale.set(0.1 * s, 0.3 * s, 0.1 * s);
      dummy.updateMatrix();
      baseMats.current.push(dummy.matrix.clone());
      phases.current.push(Math.random() * Math.PI * 2);
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [frozen]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || baseMats.current.length === 0) return;
    const t = clock.getElapsedTime();
    const wind = (windRef.current ?? 0);
    const amp = 0.05 + wind * 0.18;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < frozen.geoCount; i++) {
      dummy.matrix.copy(baseMats.current[i]);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      dummy.rotation.setFromQuaternion(dummy.quaternion);
      dummy.rotation.z += Math.sin(t * 1.1 + phases.current[i]) * amp;
      dummy.rotation.x += Math.sin(t * 0.8 + phases.current[i] + 1.3) * amp * 0.5;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, Math.max(frozen.geoCount, 1)]}>
      <coneGeometry args={[0.015, 1.0, 4, 1]} />
      <meshStandardMaterial color="#3f7f2d" roughness={0.95} transparent opacity={0.85} />
    </instancedMesh>
  );
}

function GlbScatter({ url, positions, windRef }: { url: string; positions: Pos[]; windRef: React.RefObject<number> }) {
  const { scene } = useGLTF(url);

  const clones = useMemo(() => positions.map((p) => {
    const clone = scene.clone(true);
    clone.rotation.y = p.ry;
    return clone;
  }), [scene, positions]);

  const phases = useMemo(() => positions.map(() => Math.random() * Math.PI * 2), [positions]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const wind = (windRef.current ?? 0);
    const amp = 0.04 + wind * 0.14;
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

function BgScene({ live, frozen }: { live: BgConfig; frozen: BgConfig }) {
  const grassPos   = useMemo(() => makePos(frozen.grassCount,  frozen.grassRadius,  frozen.grassScaleMin,  frozen.grassScaleMax,  frozen.groundY, frozen.grassYOffset, frozen.grassCurvature), [frozen]);
  const ivyPos     = useMemo(() => makePos(frozen.ivyCount,    frozen.plantRadius,  frozen.plantScaleMin,  frozen.plantScaleMax,  frozen.groundY, frozen.plantYOffset), [frozen]);
  const leopardPos = useMemo(() => makePos(frozen.leopardCount,frozen.plantRadius,  frozen.plantScaleMin,  frozen.plantScaleMax,  frozen.groundY, frozen.plantYOffset), [frozen]);
  const cloverPos  = useMemo(() => makePos(frozen.cloverCount, frozen.plantRadius,  frozen.plantScaleMin,  frozen.plantScaleMax,  frozen.groundY, frozen.plantYOffset), [frozen]);

  // Wind energy: increases with pointer/touch velocity, decays over time
  const windRef = useRef(0);

  useEffect(() => {
    let lastX = 0, lastY = 0;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const speed = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
      windRef.current = Math.min(windRef.current + speed * 0.012, 1);
      lastX = x; lastY = y;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, []);

  // Decay wind energy each frame back to 0
  useFrame((_, delta) => {
    windRef.current = Math.max(windRef.current - delta * 1.2, 0);
  });

  return (
    <>
      <CameraController x={live.camX} y={live.camY} z={live.camZ} fov={live.camFov} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 8, 5]} intensity={2.5} />

      <Ground cfg={live} />
      <GeoGrass frozen={frozen} windRef={windRef} />

      <GlbScatter url={MODEL_PATHS.GRASS}         positions={grassPos} windRef={windRef} />
      <GlbScatter url={MODEL_PATHS.IVY}           positions={ivyPos}   windRef={windRef} />
      <GlbScatter url={MODEL_PATHS.LEOPARD_PLANT} positions={leopardPos} windRef={windRef} />
      <GlbScatter url={MODEL_PATHS.WHITE_CLOVER}  positions={cloverPos}  windRef={windRef} />
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function Scene2Background() {
  const [live, setLive] = useState<BgConfig>(DEFAULT);
  const [frozen, setFrozen] = useState<BgConfig>(DEFAULT);

  // Auto-rebuild 400ms after any slider stops moving
  useEffect(() => {
    const t = setTimeout(() => setFrozen({ ...live }), 400);
    return () => clearTimeout(t);
  }, [live]);

  const rebuild = () => setFrozen({ ...live });

  const set = (p: Partial<BgConfig>) => setLive((prev) => ({ ...prev, ...p }));

  return (
    <>
      <Canvas
        camera={{ position: [DEFAULT.camX, DEFAULT.camY, DEFAULT.camZ], fov: DEFAULT.camFov }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        className="z-10"
        style={{ position: 'absolute', inset: 0 }}
      >
        <BgScene live={live} frozen={frozen} />
      </Canvas>

      {/* ── Debug panel ─────────────────────────────────────────────── */}
      {SHOW_DEBUG && <div style={{
        position: 'fixed', left: 8, top: 56, bottom: 12, zIndex: 50,
        width: 210, overflowY: 'auto', scrollbarWidth: 'thin',
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
        padding: '10px 12px', fontFamily: 'monospace', fontSize: 10,
        color: '#fff', userSelect: 'none',
      }}>
        <Lbl>Fundo — debug</Lbl>

        <Sec label="Câmara ✦ tempo real">
          <Sl label="Cam X"  v={live.camX}  min={-5} max={5} step={0.05} o={(v) => set({ camX: v })} />
          <Sl label="Cam Y"  v={live.camY}  min={-10} max={10} step={0.05} o={(v) => set({ camY: v })} />
          <Sl label="Cam Z"  v={live.camZ}  min={0.5} max={10} step={0.1} o={(v) => set({ camZ: v })} />
          <Sl label="FOV"    v={live.camFov} min={40} max={120} step={1} o={(v) => set({ camFov: v })} />
        </Sec>

        <Sec label="Chão ✦ tempo real">
          <Sl label="Tamanho"  v={live.groundSize}    min={1} max={40}  step={0.5} o={(v) => set({ groundSize: v })} />
          <Sl label="Y"        v={live.groundY}       min={-8} max={1}  step={0.05} o={(v) => set({ groundY: v })} />
          <Sl label="Opacidade" v={live.groundOpacity} min={0} max={1}  step={0.02} o={(v) => set({ groundOpacity: v })} />
        </Sec>

        <Sec label="Relva Geométrica" rebuild>
          <Sl label="Count"     v={live.geoCount}    min={0}   max={300} step={1}    o={(v) => set({ geoCount: Math.round(v) })} />
          <Sl label="Raio"      v={live.geoRadius}   min={0.1} max={10}  step={0.1}  o={(v) => set({ geoRadius: v })} />
          <Sl label="Esc Min"   v={live.geoScaleMin} min={0.01} max={3}  step={0.01} o={(v) => set({ geoScaleMin: v })} />
          <Sl label="Esc Max"   v={live.geoScaleMax} min={0.01} max={3}  step={0.01} o={(v) => set({ geoScaleMax: v })} />
          <Sl label="Y s/ chão" v={live.geoYOffset}  min={-1}  max={2}   step={0.05} o={(v) => set({ geoYOffset: v })} />
          <Sl label="Curvatura" v={live.geoCurvature} min={-2} max={2}   step={0.05} o={(v) => set({ geoCurvature: v })} />
        </Sec>

        <Sec label="grass.glb" rebuild>
          <Sl label="Count"    v={live.grassCount}    min={0}   max={80}  step={1}    o={(v) => set({ grassCount: Math.round(v) })} />
          <Sl label="Raio"     v={live.grassRadius}   min={0.1} max={10}  step={0.1}  o={(v) => set({ grassRadius: v })} />
          <Sl label="Esc Min"  v={live.grassScaleMin} min={0.01} max={2}  step={0.01} o={(v) => set({ grassScaleMin: v })} />
          <Sl label="Esc Max"  v={live.grassScaleMax} min={0.01} max={2}  step={0.01} o={(v) => set({ grassScaleMax: v })} />
          <Sl label="Y s/ chão" v={live.grassYOffset} min={-1}  max={2}   step={0.05} o={(v) => set({ grassYOffset: v })} />
          <Sl label="Curvatura" v={live.grassCurvature} min={-2} max={2}  step={0.05} o={(v) => set({ grassCurvature: v })} />
        </Sec>

        <Sec label="Plantas" rebuild>
          <Sl label="Hera"    v={live.ivyCount}     min={0} max={20} step={1}     o={(v) => set({ ivyCount: Math.round(v) })} />
          <Sl label="Leopard" v={live.leopardCount} min={0} max={20} step={1}     o={(v) => set({ leopardCount: Math.round(v) })} />
          <Sl label="Trevo"   v={live.cloverCount}  min={0} max={30} step={1}     o={(v) => set({ cloverCount: Math.round(v) })} />
          <Sl label="Raio"    v={live.plantRadius}  min={0.1} max={10} step={0.1} o={(v) => set({ plantRadius: v })} />
          <Sl label="Esc Min" v={live.plantScaleMin} min={0.01} max={2} step={0.01} o={(v) => set({ plantScaleMin: v })} />
          <Sl label="Esc Max" v={live.plantScaleMax} min={0.01} max={2} step={0.01} o={(v) => set({ plantScaleMax: v })} />
          <Sl label="Y s/ chão" v={live.plantYOffset} min={-1} max={2}  step={0.05} o={(v) => set({ plantYOffset: v })} />
        </Sec>

        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <Btn color="#27ae60" onClick={rebuild}>Rebuild</Btn>
          <Btn color="#c0392b" onClick={() => { setLive(DEFAULT); setTimeout(() => setFrozen(DEFAULT), 50); }}>Reset</Btn>
        </div>
        <div style={{ marginTop: 8, fontSize: 7, opacity: 0.25, lineHeight: 1.6 }}>
          Tudo atualiza 400ms após parares. Rebuild = imediato.
        </div>
      </div>}
    </>
  );
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function Lbl({ children }: { children: React.ReactNode }) {
  return <div style={{ opacity: 0.35, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>{children}</div>;
}
function Sec({ label, rebuild, children }: { label: string; rebuild?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4 }}>{label}</span>
        {rebuild && <span style={{ fontSize: 7, opacity: 0.22 }}>[Rebuild]</span>}
      </div>
      {children}
    </div>
  );
}
function Sl({ label, v, min, max, step, o }: { label: string; v: number; min: number; max: number; step: number; o: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5, marginBottom: 1 }}>
        <span>{label}</span><span>{step < 0.1 ? v.toFixed(2) : v % 1 === 0 ? v : v.toFixed(1)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v}
        onChange={(e) => o(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#7af', cursor: 'pointer' }} />
    </div>
  );
}
function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '5px 0', fontSize: 10,
      background: `${color}33`, border: `1px solid ${color}77`,
      borderRadius: 5, color: '#fff', cursor: 'pointer',
    }}>{children}</button>
  );
}

useGLTF.preload(MODEL_PATHS.GRASS);
useGLTF.preload(MODEL_PATHS.IVY);
useGLTF.preload(MODEL_PATHS.LEOPARD_PLANT);
useGLTF.preload(MODEL_PATHS.WHITE_CLOVER);
