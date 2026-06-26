import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODEL_PATHS } from '../../constants/assets';

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

const HIB_SCALE = 1.29;
const HIB_POS: [number, number, number] = [-0.04, -0.13, -0.14];
const HIB_ROT: [number, number, number] = [0, 1.54, 0];
const HIB_ANIM_SPEED = 0.7;

export function Anchor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hibRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let mindarInstance: any = null;
    let rendererRef: THREE.WebGLRenderer | null = null;

    const run = async () => {
      const buffer = await getBuffer();
      if (!buffer || cancelled || !containerRef.current) return;

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

      const loader = new GLTFLoader();
      const hibGltf = await new Promise<{ scene: THREE.Object3D; animations: THREE.AnimationClip[] }>(
        (res, rej) => loader.load(MODEL_PATHS.FLOWER_ANIMATION, res, undefined, rej)
      );
      if (cancelled) return;
      const hib = hibGltf.scene;
      hib.scale.setScalar(0);
      hib.position.set(...HIB_POS);
      hib.rotation.set(...HIB_ROT);
      hibRef.current = hib;
      anchor.group.add(hib);

      if (hibGltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(hib);
        mixerRef.current = mixer;
        mixer.clipAction(hibGltf.animations[0]).play();
      }

      let bloomProgress = 1;
      let bloomActive = false;

      anchor.onTargetFound = () => {
        if (!cancelled) { bloomProgress = 0; bloomActive = true; }
      };

      try { await mindarThree.start(); } catch { return; }
      if (cancelled) { try { mindarThree.stop(); } catch { /* */ } return; }

      let lastTime = performance.now();

      renderer.setAnimationLoop(() => {
        if (cancelled) return;
        const now = performance.now();
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        if (bloomActive && hibRef.current) {
          bloomProgress = Math.min(bloomProgress + delta * 0.65, 1);
          const eased = 1 - Math.pow(1 - bloomProgress, 3);
          hibRef.current.scale.setScalar(HIB_SCALE * eased);
          if (bloomProgress >= 1) bloomActive = false;
        }

        if (mixerRef.current) {
          mixerRef.current.timeScale = HIB_ANIM_SPEED;
          mixerRef.current.update(delta);
        }

        renderer.render(scene, camera);
      });
    };

    run().catch(() => {});

    return () => {
      cancelled = true;
      rendererRef?.setAnimationLoop(null);
      hibRef.current = null;
      mixerRef.current = null;
      if (mindarInstance) { try { mindarInstance.stop(); } catch { /* */ } }
    };
  }, []);

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
    </>
  );
}
