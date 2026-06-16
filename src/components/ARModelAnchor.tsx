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

interface Props {
  targetIndex: number;
  modelUrl: string;
  modelScale: number;
  debug?: boolean;
}

export function ARModelAnchor({ targetIndex, modelUrl, modelScale, debug = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  const [scale, setScale] = useState(modelScale);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);
  const [status, setStatus] = useState<Status>('idle');

  // Sync debug values → Three.js object in real-time
  useEffect(() => {
    const m = modelRef.current;
    if (!m) return;
    m.scale.setScalar(scale);
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

      anchor.onTargetFound = () => { if (!cancelled) setStatus('found'); };
      anchor.onTargetLost  = () => { if (!cancelled) setStatus('ready'); };

      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf: { scene: THREE.Object3D }) => {
        if (cancelled) return;
        const model = gltf.scene;
        // Apply current debug values (scale/position may have been changed already)
        model.scale.setScalar(scale);
        model.position.set(posX, posY, posZ);
        modelRef.current = model;
        anchor.group.add(model);
      });

      try {
        await mindarThree.start();
      } catch (err) {
        if (!cancelled) setStatus('error');
        return;
      }
      if (cancelled) { try { mindarThree.stop(); } catch { /* */ } return; }
      if (!cancelled) setStatus('ready');

      renderer.setAnimationLoop(() => {
        if (cancelled) return;
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
