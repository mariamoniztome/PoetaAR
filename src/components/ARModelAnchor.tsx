import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DB_NAME = 'poeta-ar';
const DB_STORE = 'cache';
const DB_KEY = 'mind-targets-v5';

async function getBuffer(): Promise<ArrayBuffer | null> {
  try {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = (e) => (e.target as IDBOpenDBRequest).result.createObjectStore(DB_STORE);
      r.onsuccess = (e) => res((e.target as IDBOpenDBRequest).result);
      r.onerror = () => rej(r.error);
    });
    return new Promise((res) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(DB_KEY);
      req.onsuccess = () => res(req.result ?? null);
      req.onerror = () => res(null);
    });
  } catch { return null; }
}

type Status = 'idle' | 'loading' | 'ready' | 'found' | 'error' | 'no-cache';

interface PetalState {
  mesh: THREE.Mesh;
  vy: number;
  vx: number;
  vz: number;
  phase: number;
  rotSpeed: number;
}

interface Props {
  targetIndex: number;
  modelUrl: string;
  modelScale: number;
  debug?: boolean;
  petals?: boolean;
}

export function ARModelAnchor({ targetIndex, modelUrl, modelScale, debug = false, petals: showPetals = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const scaleRef = useRef(modelScale);

  const [scale, setScale] = useState(modelScale);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);
  const [status, setStatus] = useState<Status>('idle');

  // Sync debug sliders → Three.js object. During bloom the animation overrides scale temporarily.
  useEffect(() => {
    scaleRef.current = scale;
    const m = modelRef.current;
    if (!m) return;
    m.position.set(posX, posY, posZ);
  }, [scale, posX, posY, posZ]);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let mindarInstance: any = null;
    let rendererRef: THREE.WebGLRenderer | null = null;

    const run = async () => {
      setStatus('loading');
      const buffer = await getBuffer();
      if (!buffer) { setStatus('no-cache'); return; }
      if (cancelled || !containerRef.current) return;

      const { MindARThree } = await import(/* @vite-ignore */ 'mind-ar/dist/mindar-image-three.prod.js');
      if (cancelled || !containerRef.current) return;

      const blobUrl = URL.createObjectURL(new Blob([buffer]));
      const mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: blobUrl,
        warmupTolerance: 5,
        missTolerance: 20,
        filterMinCF: 0.001,
        filterBeta: 100,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
      });
      mindarInstance = mindarThree;

      const { renderer, scene, camera } = mindarThree;
      rendererRef = renderer;

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(window.devicePixelRatio);

      scene.add(new THREE.AmbientLight(0xffffff, 1.5));
      const dir = new THREE.DirectionalLight(0xffffff, 2.5);
      dir.position.set(3, 8, 5);
      scene.add(dir);

      const anchor = mindarThree.addAnchor(targetIndex);

      // Bloom state — resets each time target is found
      let bloomProgress = 1;
      let bloomActive = false;

      anchor.onTargetFound = () => {
        if (!cancelled) {
          setStatus('found');
          bloomProgress = 0;
          bloomActive = true;
        }
      };
      anchor.onTargetLost = () => { if (!cancelled) setStatus('ready'); };

      // Petal particles
      const petalList: PetalState[] = [];

      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf: { scene: THREE.Object3D }) => {
        if (cancelled) return;
        const model = gltf.scene;
        model.scale.setScalar(0); // starts invisible; bloom animates in
        model.position.set(posX, posY, posZ);
        modelRef.current = model;
        anchor.group.add(model);

        if (showPetals) {
          const colors = [0xff88cc, 0xffaae0, 0xffb3de, 0xffffff, 0xdd99ff, 0xffccee, 0xff66b3];
          for (let i = 0; i < 60; i++) {
            const geo = new THREE.PlaneGeometry(0.03, 0.06);
            const mat = new THREE.MeshBasicMaterial({
              color: colors[Math.floor(Math.random() * colors.length)],
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0,
              depthWrite: false,
            });
            const mesh = new THREE.Mesh(geo, mat);
            // scatter in a cylinder around the model
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 0.25;
            mesh.position.set(
              Math.cos(angle) * r,
              -0.05 + Math.random() * 0.15,
              Math.sin(angle) * r
            );
            mesh.rotation.set(
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            );
            anchor.group.add(mesh);
            petalList.push({
              mesh,
              vy: 0.004 + Math.random() * 0.007,
              vx: (Math.random() - 0.5) * 0.003,
              vz: (Math.random() - 0.5) * 0.003,
              phase: Math.random() * Math.PI * 2,
              rotSpeed: 0.02 + Math.random() * 0.04,
            });
          }
        }
      });

      try {
        await mindarThree.start();
      } catch {
        if (!cancelled) setStatus('error');
        return;
      }
      if (cancelled) { try { mindarThree.stop(); } catch { /* */ } return; }
      if (!cancelled) setStatus('ready');

      let lastTime = performance.now();

      renderer.setAnimationLoop(() => {
        if (cancelled) return;

        const now = performance.now();
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const t = now * 0.001;

        // Bloom: ease-out cubic from scale 0 → target scale
        if (bloomActive && modelRef.current) {
          bloomProgress = Math.min(bloomProgress + delta * 0.75, 1);
          const eased = 1 - Math.pow(1 - bloomProgress, 3);
          modelRef.current.scale.setScalar(scaleRef.current * eased);
          if (bloomProgress >= 1) bloomActive = false;
        }

        // Petal rise + drift + fade in/out
        if (showPetals) {
          for (const p of petalList) {
            p.mesh.position.y += p.vy;
            p.mesh.position.x += p.vx + Math.sin(t * 1.3 + p.phase) * 0.002;
            p.mesh.position.z += p.vz + Math.cos(t * 0.9 + p.phase) * 0.002;
            p.mesh.rotation.z += p.rotSpeed;
            p.mesh.rotation.x += p.rotSpeed * 0.4;

            const mat = p.mesh.material as THREE.MeshBasicMaterial;
            // fade in when rising, fade out near top
            const height = p.mesh.position.y;
            if (height < 0.3) {
              mat.opacity = Math.min(mat.opacity + 0.025, 0.85);
            } else if (height > 1.0) {
              mat.opacity = Math.max(mat.opacity - 0.02, 0);
            }

            // reset petal when fully faded or too high
            if (height > 1.6 || (height > 1.0 && mat.opacity <= 0)) {
              const angle = Math.random() * Math.PI * 2;
              const r = Math.random() * 0.2;
              p.mesh.position.set(Math.cos(angle) * r, -0.05, Math.sin(angle) * r);
              mat.opacity = 0;
            }
          }
        }

        renderer.render(scene, camera);
      });
    };

    run().catch(() => { if (!cancelled) setStatus('error'); });

    return () => {
      cancelled = true;
      rendererRef?.setAnimationLoop(null);
      modelRef.current = null;
      if (mindarInstance) { try { mindarInstance.stop(); } catch { /* */ } }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex, modelUrl]);

  const statusLabel: Record<Status, string> = {
    idle: 'idle',
    loading: 'a carregar…',
    ready: 'a escanear',
    found: '✓ target encontrado',
    error: '✗ erro câmara',
    'no-cache': '✗ sem cache (abre o scanner primeiro)',
  };

  return (
    <>
      <style>{`
        .ar-anchor-layer video { display: none !important; }
        .ar-anchor-layer canvas {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: transparent !important;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={containerRef}
        className="ar-anchor-layer"
        style={{ position: 'fixed', inset: 0, zIndex: 30, pointerEvents: 'none' }}
      />

      {debug && (
        <div style={{
          position: 'fixed', right: 12, top: 80, zIndex: 50,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
          padding: '10px 14px', minWidth: 220, fontFamily: 'monospace',
          fontSize: 11, color: '#fff', userSelect: 'none',
        }}>
          <div style={{ marginBottom: 8, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 9 }}>
            Âncora AR — debug
          </div>

          <div style={{ marginBottom: 10, fontSize: 10, opacity: 0.7 }}>
            {statusLabel[status]}
          </div>

          <DebugRow label="Escala" value={scale} min={0.001} max={2} step={0.001}
            onChange={setScale} />
          <DebugRow label="Pos X" value={posX} min={-3} max={3} step={0.01}
            onChange={setPosX} />
          <DebugRow label="Pos Y" value={posY} min={-3} max={3} step={0.01}
            onChange={setPosY} />
          <DebugRow label="Pos Z" value={posZ} min={-3} max={3} step={0.01}
            onChange={setPosZ} />

          <button
            onClick={() => { setScale(modelScale); setPosX(0); setPosY(0); setPosZ(0); }}
            style={{
              marginTop: 8, width: '100%', padding: '3px 0',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 10,
            }}
          >
            reset
          </button>
        </div>
      )}
    </>
  );
}

function DebugRow({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, opacity: 0.6 }}>
        <span>{label}</span>
        <span>{value.toFixed(3)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#fff', cursor: 'pointer' }}
      />
    </div>
  );
}
