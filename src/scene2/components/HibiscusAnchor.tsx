import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODEL_PATHS } from '../../constants/assets';

const SHOW_DEBUG = false;

// ─── IndexedDB ────────────────────────────────────────────────────────────────

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

// ─── Config ───────────────────────────────────────────────────────────────────

interface Config {
  hibScale: number;
  hibX: number; hibY: number; hibZ: number;
  hibRotX: number; hibRotY: number; hibRotZ: number;
  hibAnimSpeed: number;
}

const DEFAULT: Config = {
  hibScale: 1.29,
  hibX: -0.04, hibY: -0.13, hibZ: -0.14,
  hibRotX: 0, hibRotY: 1.54, hibRotZ: 0,
  hibAnimSpeed: 0.7,
};

type Status = 'idle' | 'loading' | 'ready' | 'found' | 'error' | 'no-cache';

// ─── Component ────────────────────────────────────────────────────────────────

export function HibiscusAnchor() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [cfg, setCfg] = useState<Config>(DEFAULT);
  const cfgRef = useRef(cfg);
  useEffect(() => { cfgRef.current = cfg; }, [cfg]);

  const [status, setStatus] = useState<Status>('idle');

  const hibRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    const h = hibRef.current;
    if (!h) return;
    h.position.set(cfg.hibX, cfg.hibY, cfg.hibZ);
    h.rotation.set(cfg.hibRotX, cfg.hibRotY, cfg.hibRotZ);
    h.scale.setScalar(cfg.hibScale);
  }, [cfg.hibX, cfg.hibY, cfg.hibZ, cfg.hibRotX, cfg.hibRotY, cfg.hibRotZ, cfg.hibScale]);

  // ── MindAR init ──────────────────────────────────────────────────────────────
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
        warmupTolerance: 5, missTolerance: 20,
        filterMinCF: 0.001, filterBeta: 100,
        uiLoading: 'no', uiScanning: 'no', uiError: 'no',
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

      const anchor = mindarThree.addAnchor(1);

      // ── Load hibiscus ────────────────────────────────────────────────────
      const loader = new GLTFLoader();
      const hibGltf = await new Promise<{ scene: THREE.Object3D; animations: THREE.AnimationClip[] }>(
        (res, rej) => loader.load(MODEL_PATHS.HIBISCUS, res, undefined, rej)
      );
      if (cancelled) return;

      const hib = hibGltf.scene;
      hib.scale.setScalar(0); // bloom animates in
      hib.position.set(cfgRef.current.hibX, cfgRef.current.hibY, cfgRef.current.hibZ);
      hib.rotation.set(cfgRef.current.hibRotX, cfgRef.current.hibRotY, cfgRef.current.hibRotZ);
      hibRef.current = hib;
      anchor.group.add(hib);

      if (hibGltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(hib);
        mixerRef.current = mixer;
        mixer.clipAction(hibGltf.animations[0]).play();
      }

      // ── Bloom ─────────────────────────────────────────────────────────────
      let bloomProgress = 1;
      let bloomActive = false;

      anchor.onTargetFound = () => {
        if (!cancelled) { setStatus('found'); bloomProgress = 0; bloomActive = true; }
      };
      anchor.onTargetLost = () => { if (!cancelled) setStatus('ready'); };

      try { await mindarThree.start(); } catch {
        if (!cancelled) setStatus('error'); return;
      }
      if (cancelled) { try { mindarThree.stop(); } catch { /* */ } return; }
      if (!cancelled) setStatus('ready');

      let lastTime = performance.now();

      renderer.setAnimationLoop(() => {
        if (cancelled) return;
        const now = performance.now();
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const c = cfgRef.current;

        if (bloomActive && hibRef.current) {
          bloomProgress = Math.min(bloomProgress + delta * 0.65, 1);
          const eased = 1 - Math.pow(1 - bloomProgress, 3);
          hibRef.current.scale.setScalar(c.hibScale * eased);
          if (bloomProgress >= 1) bloomActive = false;
        }

        if (mixerRef.current) {
          mixerRef.current.timeScale = c.hibAnimSpeed;
          mixerRef.current.update(delta);
        }

        renderer.render(scene, camera);
      });
    };

    run().catch(() => { if (!cancelled) setStatus('error'); });

    return () => {
      cancelled = true;
      rendererRef?.setAnimationLoop(null);
      hibRef.current = null;
      mixerRef.current = null;
      if (mindarInstance) { try { mindarInstance.stop(); } catch { /* */ } }
    };
  }, []);

  const set = (partial: Partial<Config>) => setCfg((p) => ({ ...p, ...partial }));

  const statusLabel: Record<Status, string> = {
    idle: '—', loading: 'a carregar…', ready: 'a escanear',
    found: '✓ target', error: '✗ erro', 'no-cache': '✗ sem cache',
  };

  return (
    <>
      <style>{`
        .hib-layer video { display: none !important; }
        .hib-layer canvas {
          position: absolute !important; inset: 0 !important;
          width: 100% !important; height: 100% !important;
          background: transparent !important; pointer-events: none;
        }
      `}</style>

      <div ref={containerRef} className="hib-layer"
        style={{ position: 'fixed', inset: 0, zIndex: 30, pointerEvents: 'none' }} />

      {/* ── Debug panel ─────────────────────────────────────────────────── */}
      {SHOW_DEBUG && <div style={{
        position: 'fixed', right: 8, top: 56, zIndex: 50,
        width: 195, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
        padding: '10px 12px', fontFamily: 'monospace', fontSize: 10,
        color: '#fff', userSelect: 'none',
      }}>
        <div style={{ opacity: 0.35, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
          Hibiscus — âncora AR
        </div>
        <div style={{ marginBottom: 10, opacity: 0.55, fontSize: 9 }}>{statusLabel[status]}</div>

        <Sl label="Escala"     v={cfg.hibScale}  min={0.01}      max={8}         step={0.01}  o={(v) => set({ hibScale: v })} />
        <Sl label="Pos X"      v={cfg.hibX}      min={-2}        max={2}         step={0.01}  o={(v) => set({ hibX: v })} />
        <Sl label="Pos Y"      v={cfg.hibY}      min={-2}        max={2}         step={0.01}  o={(v) => set({ hibY: v })} />
        <Sl label="Pos Z"      v={cfg.hibZ}      min={-2}        max={2}         step={0.01}  o={(v) => set({ hibZ: v })} />
        <Sl label="Rot X"      v={cfg.hibRotX}   min={-Math.PI}  max={Math.PI}   step={0.01}  o={(v) => set({ hibRotX: v })} />
        <Sl label="Rot Y"      v={cfg.hibRotY}   min={-Math.PI}  max={Math.PI}   step={0.01}  o={(v) => set({ hibRotY: v })} />
        <Sl label="Rot Z"      v={cfg.hibRotZ}   min={-Math.PI}  max={Math.PI}   step={0.01}  o={(v) => set({ hibRotZ: v })} />
        <Sl label="Anim Speed" v={cfg.hibAnimSpeed} min={0}      max={5}         step={0.1}   o={(v) => set({ hibAnimSpeed: v })} />

        <button onClick={() => setCfg(DEFAULT)} style={{
          marginTop: 8, width: '100%', padding: '4px 0', fontSize: 10,
          background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.5)',
          borderRadius: 5, color: '#fff', cursor: 'pointer',
        }}>Reset</button>
      </div>}
    </>
  );
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function Sl({ label, v, min, max, step, o }: {
  label: string; v: number; min: number; max: number; step: number; o: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5, marginBottom: 1 }}>
        <span>{label}</span>
        <span>{step < 0.01 ? v.toFixed(3) : step < 0.1 ? v.toFixed(2) : v % 1 === 0 ? v : v.toFixed(1)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v}
        onChange={(e) => o(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#f9a', cursor: 'pointer' }} />
    </div>
  );
}
