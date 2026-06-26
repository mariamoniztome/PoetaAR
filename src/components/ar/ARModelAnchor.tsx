import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DB_NAME = 'poeta-ar';
const DB_STORE = 'cache';
const DB_KEY = 'mind-targets-v6';

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

interface Props {
  targetIndex: number;
  modelUrl: string;
  modelScale: number;
  initialPos?: [number, number, number];
  initialRot?: [number, number, number];
}

export function ARModelAnchor({ targetIndex, modelUrl, modelScale, initialPos, initialRot }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
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

      let bloomProgress = 1;
      let bloomActive = false;

      anchor.onTargetFound = () => {
        if (!cancelled) { bloomProgress = 0; bloomActive = true; }
      };

      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf: { scene: THREE.Object3D; animations: THREE.AnimationClip[] }) => {
        if (cancelled) return;
        const model = gltf.scene;
        model.scale.setScalar(0);
        if (initialPos) model.position.set(...initialPos);
        if (initialRot) model.rotation.set(...initialRot);
        modelRef.current = model;
        anchor.group.add(model);

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          mixer.clipAction(gltf.animations[0]).play();
        }
      });

      try {
        await mindarThree.start();
      } catch {
        return;
      }
      if (cancelled) { try { mindarThree.stop(); } catch { /* */ } return; }

      let lastTime = performance.now();

      renderer.setAnimationLoop(() => {
        if (cancelled) return;
        const now = performance.now();
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        if (mixerRef.current) mixerRef.current.update(delta);

        if (bloomActive && modelRef.current) {
          bloomProgress = Math.min(bloomProgress + delta * 0.75, 1);
          const eased = 1 - Math.pow(1 - bloomProgress, 3);
          modelRef.current.scale.setScalar(modelScale * eased);
          if (bloomProgress >= 1) bloomActive = false;
        }

        renderer.render(scene, camera);
      });
    };

    run().catch(() => {});

    return () => {
      cancelled = true;
      rendererRef?.setAnimationLoop(null);
      modelRef.current = null;
      mixerRef.current = null;
      if (mindarInstance) { try { mindarInstance.stop(); } catch { /* */ } }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex, modelUrl]);

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
    </>
  );
}
