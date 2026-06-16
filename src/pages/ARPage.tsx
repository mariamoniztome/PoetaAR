import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';

// ─── IndexedDB cache ──────────────────────────────────────────────────────────

const DB_NAME = 'poeta-ar';
const DB_STORE = 'cache';
const DB_KEY = 'mind-targets-v5';

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
  '/targets/target1.png',
  '/targets/target2.jpeg',
  '/targets/target3.png',
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
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [imgStatus, setImgStatus] = useState<Array<'pending' | 'ok' | 'error'>>(TARGETS.map(() => 'pending'));

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let mindarInstance: any = null;

    const log = (msg: string) => {
      if (cancelled) return;
      const ts = new Date().toLocaleTimeString('pt-PT', { hour12: false });
      setDebugLog(prev => [...prev.slice(-40), `${ts}  ${msg}`]);
    };

    const run = async () => {
      try {
        log('A carregar módulos MindAR...');
        const [{ MindARThree }, { Compiler }] = await Promise.all([
          import(/* @vite-ignore */ 'mind-ar/dist/mindar-image-three.prod.js'),
          import(/* @vite-ignore */ 'mind-ar/dist/mindar-image.prod.js'),
        ]);

        if (cancelled) return;
        log('Módulos OK. A verificar cache...');

        let buffer: ArrayBuffer | null = await dbGet(DB_KEY);

        if (!buffer) {
          log('Cache não encontrada — a carregar imagens...');
          setPhase('compiling');
          setProgress(0);
          const images = await Promise.all(
            TARGETS.map((src, i) =>
              loadHTMLImage(src)
                .then((img) => {
                  log(`Target ${i + 1} OK: ${src.split('/').pop()}`);
                  setImgStatus(prev => { const n = [...prev]; n[i] = 'ok'; return n; });
                  return img;
                })
                .catch((err: Error) => {
                  log(`Target ${i + 1} ERRO: ${err.message}`);
                  setImgStatus(prev => { const n = [...prev]; n[i] = 'error'; return n; });
                  throw err;
                })
            )
          );
          if (cancelled) return;
          log('Imagens carregadas — a compilar targets...');
          const compiler = new Compiler();
          await compiler.compileImageTargets(images, (p: number) => {
            if (!cancelled) setProgress(Math.min(100, Math.round(p)));
          });
          if (cancelled) return;
          log('Compilação completa — a guardar cache...');
          const compiled = (await compiler.exportData()) as ArrayBuffer;
          await dbSet(DB_KEY, compiled);
          buffer = compiled;
          log('Cache guardada.');
        } else {
          log('Cache encontrada — compilação saltada.');
          setImgStatus(TARGETS.map(() => 'ok'));
        }

        if (cancelled || !containerRef.current) return;

        log('A criar instância MindAR...');
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
            log(`TARGET ${i + 1} DETECTADO → ${SCENE_ROUTES[i]}`);
            if (!cancelled) navigate(SCENE_ROUTES[i]);
          };
          anchor.onTargetLost = () => {
            log(`Target ${i + 1} perdido`);
          };
        });

        log(`${TARGETS.length} anchors prontos. A iniciar scanner...`);
        setPhase('scanning');
        await mindarThree.start();
        log('Scanner activo — aponta para um target.');
        if (cancelled) { try { mindarThree.stop(); } catch { /* */ } return; }

        renderer.setAnimationLoop(() => {
          if (cancelled) return;
          renderer.render(scene, camera);
        });

      } catch (err) {
        console.error('ARPage error:', err);
        log(`ERRO: ${err instanceof Error ? err.message : String(err)}`);
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

      {/* Debug toggle */}
      <button
        onClick={() => setShowDebug(p => !p)}
        className="fixed bottom-6 right-6 z-50 px-3 py-1.5 bg-black/50 border border-white/20 rounded text-white/50 text-[10px] font-mono uppercase tracking-widest hover:bg-black/70 transition-colors"
      >
        {showDebug ? 'Fechar Debug' : 'Debug'}
      </button>

      {showDebug && (
        <div className="fixed bottom-16 right-6 z-50 w-80 max-h-[65vh] bg-black/85 border border-white/20 rounded-xl backdrop-blur-md text-white font-mono overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-white/40">MindAR Debug</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              phase === 'scanning'  ? 'bg-green-500/30 text-green-400' :
              phase === 'compiling' ? 'bg-yellow-500/30 text-yellow-400' :
              phase === 'error'     ? 'bg-red-500/30 text-red-400' :
                                     'bg-white/10 text-white/40'
            }`}>{phase} {phase === 'compiling' ? `${progress}%` : ''}</span>
          </div>

          {/* Targets */}
          <div className="px-3 py-2 border-b border-white/10 space-y-1 shrink-0">
            {TARGETS.map((src, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  imgStatus[i] === 'ok'    ? 'bg-green-400' :
                  imgStatus[i] === 'error' ? 'bg-red-400' :
                                             'bg-white/20 animate-pulse'
                }`} />
                <span className="text-white/50 truncate text-[10px]">T{i + 1}: {src.split('/').pop()}</span>
              </div>
            ))}
          </div>

          {/* Log */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
            {debugLog.length === 0 && (
              <p className="text-white/20 text-[10px]">Sem logs ainda...</p>
            )}
            {debugLog.map((line, i) => (
              <p key={i} className={`text-[10px] leading-relaxed break-all ${
                line.includes('ERRO')      ? 'text-red-400' :
                line.includes('DETECTADO') ? 'text-green-400 font-bold' :
                                             'text-white/45'
              }`}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
