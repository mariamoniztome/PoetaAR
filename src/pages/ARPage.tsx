import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';

// ─── IndexedDB cache ──────────────────────────────────────────────────────────

const DB_NAME = 'poeta-ar';
const DB_STORE = 'cache';
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
  } catch { return null; }
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
  } catch { /* ignore */ }
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

const TARGETS = [
  '/targets/1.jpeg',
  '/targets/2.jpeg',
  '/targets/3.jpeg',
];

// anchor index → scene route
const SCENE_ROUTES = ['/scene/sea', '/scene/field', '/scene/sky'];

// ─── Component ────────────────────────────────────────────────────────────────

type Phase = 'init' | 'compiling' | 'scanning' | 'error';

export default function ARPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('init');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let mindarInstance: any = null;

    const run = async () => {
      try {
        const [{ MindARThree }, { Compiler }] = await Promise.all([
          import(/* @vite-ignore */ 'mind-ar/dist/mindar-image-three.prod.js'),
          import(/* @vite-ignore */ 'mind-ar/dist/mindar-image.prod.js'),
        ]);

        if (cancelled) return;

        let buffer: ArrayBuffer | null = await dbGet(DB_KEY);

        if (!buffer) {
          setPhase('compiling');
          setProgress(0);
          const images = await Promise.all(TARGETS.map(loadHTMLImage));
          if (cancelled) return;
          const compiler = new Compiler();
          await compiler.compileImageTargets(images, (p: number) => {
            if (!cancelled) setProgress(Math.min(100, Math.round(p)));
          });
          if (cancelled) return;
          const compiled = (await compiler.exportData()) as ArrayBuffer;
          await dbSet(DB_KEY, compiled);
          buffer = compiled;
        }

        if (cancelled || !containerRef.current) return;

        const blobUrl = URL.createObjectURL(new Blob([buffer as ArrayBuffer]));
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
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

        TARGETS.forEach((_, i) => {
          const anchor = mindarThree.addAnchor(i);
          anchor.onTargetFound = () => {
            if (!cancelled) navigate(SCENE_ROUTES[i]);
          };
        });

        setPhase('scanning');
        await mindarThree.start();
        if (cancelled) { try { mindarThree.stop(); } catch { /* */ } return; }

        renderer.setAnimationLoop(() => {
          if (cancelled) return;
          renderer.render(scene, camera);
        });

      } catch (err) {
        console.error('ARPage error:', err);
        if (!cancelled) setPhase('error');
      }
    };

    run();

    return () => {
      cancelled = true;
      if (mindarInstance) {
        try { mindarInstance.stop(); } catch { /* */ }
      }
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <style>{`
        .ar-container video {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        .ar-container canvas {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
      <div ref={containerRef} className="ar-container" style={{ position: 'absolute', inset: 0 }} />

      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft size={20} />
      </button>

      {phase === 'init' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <Loader className="w-8 h-8 text-white/30 animate-spin" />
        </div>
      )}

      {phase === 'compiling' && (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 px-8 text-white pointer-events-none">
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

      {phase === 'scanning' && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-mono">
            Aponta para uma das imagens do Poeta
          </p>
        </div>
      )}

      {phase === 'error' && (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 px-8 text-white pointer-events-none">
          <p className="text-sm text-white/50 text-center max-w-xs leading-relaxed">
            Não foi possível iniciar o reconhecimento. Verifica as permissões da câmara.
          </p>
        </div>
      )}

    </div>
  );
}
