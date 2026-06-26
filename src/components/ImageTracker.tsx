import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader } from 'lucide-react';

interface ImageTrackerProps {
  onClose: () => void;
}

const TARGETS = [
  { src: '/targets/1.jpeg', route: '/scene/sea' },
  { src: '/targets/2.jpeg', route: '/scene/field' },
  { src: '/targets/3.jpeg', route: '/scene/sky' },
];

const DB_NAME = 'poeta-ar';
const DB_STORE = 'cache';
// Bump this version string whenever any target image is replaced,
// so the cached compilation is discarded and rebuilt from the new images.
const DB_KEY = 'mind-targets-v6';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore(DB_STORE);
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function dbSet(key: string, value: ArrayBuffer): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore cache errors
  }
}

function loadHTMLImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

type Phase = 'init' | 'compiling' | 'tracking' | 'error';

export default function ImageTracker({ onClose }: ImageTrackerProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('init');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let mindarInstance: any = null;

    const run = async () => {
      try {
        const [{ MindARThree }, { Compiler }] = await Promise.all([
          import(/* @vite-ignore */ 'mind-ar/dist/mindar-image-three.prod.js'),
          import(/* @vite-ignore */ 'mind-ar/dist/mindar-image.prod.js'),
        ]);

        if (cancelled || !containerRef.current) return;

        let buffer: ArrayBuffer | null = await dbGet(DB_KEY);

        if (!buffer) {
          setPhase('compiling');
          setProgress(0);

          const images = await Promise.all(TARGETS.map((t) => loadHTMLImage(t.src)));
          if (cancelled) return;

          const compiler = new Compiler();
          await compiler.compileImageTargets(images, (p: number) => {
            if (!cancelled) setProgress(Math.min(100, Math.max(0, Math.round(p))));
          });

          if (cancelled) return;
          const compiled = (await compiler.exportData()) as ArrayBuffer;
          await dbSet(DB_KEY, compiled);
          buffer = compiled;
        }

        if (cancelled || !containerRef.current) return;

        const blobUrl = URL.createObjectURL(new Blob([buffer as ArrayBuffer]));
        setPhase('tracking');

        // Wait one frame so the browser has laid out the container and
        // clientWidth/clientHeight are non-zero before MindARThree reads them.
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (cancelled || !containerRef.current) return;

        const mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: blobUrl,
          uiLoading: 'no',
          uiScanning: 'no',
          uiError: 'no',
        });

        mindarInstance = mindarThree;
        const { renderer, scene, camera } = mindarThree;

        const safeStop = () => {
          try { mindarThree.stop(); } catch { /* ignore */ }
        };

        TARGETS.forEach(({ route }, i) => {
          const anchor = mindarThree.addAnchor(i);
          anchor.onTargetFound = () => {
            if (cancelled) return;
            cancelled = true;
            renderer.setAnimationLoop(null);
            safeStop();
            URL.revokeObjectURL(blobUrl);
            navigate(route);
            onClose();
          };
        });

        await mindarThree.start();
        if (cancelled) { safeStop(); return; }

        // Ensure the WebGL canvas clears to transparent so the camera video
        // underneath is visible through it.
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.background = 'transparent';

        renderer.setAnimationLoop(() => {
          if (!cancelled) renderer.render(scene, camera);
        });
      } catch (err) {
        console.error('ImageTracker error:', err);
        if (!cancelled) setPhase('error');
      }
    };

    run();

    return () => {
      cancelled = true;
      if (mindarInstance) {
        try {
          mindarInstance.stop();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [navigate, onClose]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0 }}
      />

      {phase === 'init' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
          <Loader className="w-8 h-8 opacity-30 animate-spin" />
        </div>
      )}

      {phase === 'compiling' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-white">
          <div className="w-full max-w-xs space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">
                A preparar reconhecimento
              </span>
              <span className="text-xs font-mono opacity-60">{progress}%</span>
            </div>
            <div className="h-px bg-white/10 relative overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 bg-white/50 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-white/25 text-center leading-relaxed">
              Primeira utilização — as seguintes serão instantâneas.
            </p>
          </div>
        </div>
      )}

      {phase === 'tracking' && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-mono">
            Aponta para uma das imagens do Poeta
          </p>
        </div>
      )}

      {phase === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-white">
          <Camera className="w-10 h-10 opacity-20" />
          <p className="text-sm text-white/50 text-center max-w-xs leading-relaxed">
            Não foi possível iniciar o reconhecimento de imagem. Verifica as
            permissões da câmara.
          </p>
        </div>
      )}
    </div>
  );
}
