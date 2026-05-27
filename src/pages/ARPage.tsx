import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Loader } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MODEL_PATHS, SOUND_PATHS } from '../constants/assets';

// ─── Ocean shader (same GLSL as scene1/components/Ocean.tsx) ─────────────────

const OCEAN_VERT = `
  uniform float uTime;
  uniform float uEnergy;
  varying float vElevation;

  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

  float cnoise(vec3 P){
    vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz; vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0/7.0; vec4 gy0 = fract(floor(gx0)/7.0)-0.5;
    gx0 = fract(gx0); vec4 gz0 = vec4(0.5)-abs(gx0)-abs(gy0);
    vec4 sz0 = step(gz0,vec4(0.0));
    gx0 -= sz0*(step(0.0,gx0)-0.5); gy0 -= sz0*(step(0.0,gy0)-0.5);
    vec4 gx1 = ixy1/7.0; vec4 gy1 = fract(floor(gx1)/7.0)-0.5;
    gx1 = fract(gx1); vec4 gz1 = vec4(0.5)-abs(gx1)-abs(gy1);
    vec4 sz1 = step(gz1,vec4(0.0));
    gx1 -= sz1*(step(0.0,gx1)-0.5); gy1 -= sz1*(step(0.0,gy1)-0.5);
    vec3 g000=vec3(gx0.x,gy0.x,gz0.x); vec3 g100=vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010=vec3(gx0.z,gy0.z,gz0.z); vec3 g110=vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001=vec3(gx1.x,gy1.x,gz1.x); vec3 g101=vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011=vec3(gx1.z,gy1.z,gz1.z); vec3 g111=vec3(gx1.w,gy1.w,gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
    g000*=norm0.x; g010*=norm0.y; g100*=norm0.z; g110*=norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
    g001*=norm1.x; g011*=norm1.y; g101*=norm1.z; g111*=norm1.w;
    float n000=dot(g000,Pf0); float n100=dot(g100,vec3(Pf1.x,Pf0.yz));
    float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)); float n110=dot(g110,vec3(Pf1.xy,Pf0.z));
    float n001=dot(g001,vec3(Pf0.xy,Pf1.z)); float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
    float n011=dot(g011,vec3(Pf0.x,Pf1.yz)); float n111=dot(g111,Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
    vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
    float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);
    return 2.2 * n_xyz;
  }

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float elevation = cnoise(vec3(modelPosition.xy * 0.2, uTime * 0.2)) * (0.5 + uEnergy * 1.5);
    elevation += cnoise(vec3(modelPosition.xy * 0.8, uTime * 0.5)) * (0.1 + uEnergy * 0.5);
    modelPosition.z += elevation;
    vElevation = elevation;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
  }
`;

const OCEAN_FRAG = `
  uniform vec3 uColorDeep;
  uniform vec3 uColorShallow;
  uniform float uEnergy;
  varying float vElevation;

  void main() {
    float mixStrength = (vElevation + 1.0) * 0.5;
    vec3 color = mix(uColorDeep, uColorShallow, mixStrength);
    float foamThreshold = 0.6 + (1.0 - uEnergy) * 0.4;
    float foam = smoothstep(foamThreshold, foamThreshold + 0.2, mixStrength);
    color = mix(color, vec3(0.9, 0.95, 1.0), foam * uEnergy * 0.8);
    gl_FragColor = vec4(color, 0.75);
  }
`;

// ─── IndexedDB cache (same as ImageTracker.tsx) ───────────────────────────────

const DB_NAME = 'poeta-ar';
const DB_STORE = 'cache';
const DB_KEY = 'mind-targets-v2';

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
  '/targets/target1.jpg',
  '/targets/target2.jpg',
  '/targets/target3.jpg',
];

// ─── Scene builders (vanilla Three.js, added to anchor.group) ────────────────

async function buildSeaScene(loader: GLTFLoader) {
  const group = new THREE.Group();
  let time = 0;

  const uniforms = {
    uTime: { value: 0 },
    uEnergy: { value: 0 },
    uColorDeep: { value: new THREE.Color('#001e36') },
    uColorShallow: { value: new THREE.Color('#006994') },
  };

  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 2.5, 64, 64),
    new THREE.ShaderMaterial({
      vertexShader: OCEAN_VERT,
      fragmentShader: OCEAN_FRAG,
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  group.add(ocean);

  try {
    const gltf = await loader.loadAsync(MODEL_PATHS.FLOATING_OBJECT);
    gltf.scene.scale.setScalar(0.085);
    // Position lighthouse at bottom-center of marker, slightly in front
    gltf.scene.position.set(0, -0.6, 0.12);
    group.add(gltf.scene);
  } catch (e) {
    console.warn('Lighthouse load failed', e);
  }

  return {
    group,
    update: (dt: number) => {
      time += dt;
      uniforms.uTime.value = time;
    },
  };
}

async function buildFieldScene(loader: GLTFLoader) {
  const group = new THREE.Group();

  // Instanced grass blades
  const grassCount = 300;
  const grassMesh = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.02, 0.1, 4),
    new THREE.MeshStandardMaterial({ color: '#3f7f2d', roughness: 0.95 }),
    grassCount
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < grassCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.sqrt(Math.random()) * 1.0;
    dummy.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 0.01);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.scale.set(1, 0.8 + Math.random() * 0.4, 1);
    dummy.updateMatrix();
    grassMesh.setMatrixAt(i, dummy.matrix);
  }
  grassMesh.instanceMatrix.needsUpdate = true;
  group.add(grassMesh);

  const flowerData: Array<{ mesh: THREE.Object3D; offset: number; speed: number }> = [];

  try {
    const gltf = await loader.loadAsync(MODEL_PATHS.FLOWER);
    for (let i = 0; i < 25; i++) {
      const clone = gltf.scene.clone(true);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * 0.85;
      clone.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 0.02);
      clone.scale.setScalar(0.11 + Math.random() * 0.04);
      group.add(clone);
      flowerData.push({ mesh: clone, offset: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.5 });
    }
  } catch (e) {
    console.warn('Flower load failed', e);
  }

  let time = 0;
  return {
    group,
    update: (dt: number) => {
      time += dt;
      for (const { mesh, offset, speed } of flowerData) {
        mesh.rotation.x = Math.sin(time * speed + offset) * 0.12;
        mesh.rotation.z = Math.cos(time * speed * 0.8 + offset) * 0.1;
      }
    },
  };
}

async function buildSkyScene(loader: GLTFLoader) {
  const group = new THREE.Group();
  const mixers: THREE.AnimationMixer[] = [];
  const birdData: Array<{
    mesh: THREE.Object3D;
    initialPos: THREE.Vector3;
    offset: number;
    speed: number;
  }> = [];

  try {
    const gltf = await loader.loadAsync(MODEL_PATHS.BIRD);
    const birdCount = 18;

    for (let i = 0; i < birdCount; i++) {
      // SkeletonUtils.clone preserves bone hierarchy for animation
      const clone = SkeletonUtils.clone(gltf.scene) as THREE.Object3D;
      const mixer = new THREE.AnimationMixer(clone);
      if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
      }
      mixers.push(mixer);

      const angle = (i / birdCount) * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.5;
      const initialPos = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.5,
        0.2 + Math.random() * 0.35
      );

      clone.position.copy(initialPos);
      clone.scale.setScalar(0.04 + Math.random() * 0.012);
      group.add(clone);

      birdData.push({
        mesh: clone,
        initialPos: initialPos.clone(),
        offset: Math.random() * Math.PI * 2,
        speed: 0.7 + Math.random() * 0.5,
      });
    }
  } catch (e) {
    console.warn('Bird load failed', e);
  }

  let time = 0;
  return {
    group,
    update: (dt: number) => {
      time += dt;
      for (const mixer of mixers) mixer.update(dt);
      for (const { mesh, initialPos, offset, speed } of birdData) {
        const nx = Math.sin(time * speed + offset) * 0.18;
        const ny = Math.cos(time * speed * 0.8 + offset) * 0.12;
        const nz = Math.sin(time * speed * 0.5 + offset * 2) * 0.06;
        mesh.position.set(initialPos.x + nx, initialPos.y + ny, initialPos.z + nz);

        // Face direction of travel
        const velocity = new THREE.Vector3(
          Math.cos(time * speed + offset) * speed * 0.18,
          -Math.sin(time * speed * 0.8 + offset) * speed * 0.096,
          Math.cos(time * speed * 0.5 + offset * 2) * speed * 0.03
        );
        if (velocity.length() > 0.001) {
          mesh.lookAt(mesh.position.clone().add(velocity.normalize().multiplyScalar(0.2)));
        }
      }
    },
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

type Phase = 'init' | 'compiling' | 'tracking' | 'error';

export default function ARPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('init');
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  const bgAudios = useRef<HTMLAudioElement[]>([]);
  const narrationAudios = useRef<HTMLAudioElement[]>([]);
  const narrationTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const bgUrls = [SOUND_PATHS.SEA_BG, SOUND_PATHS.FIELD_BG, SOUND_PATHS.SKY_BG];
    const narUrls = [SOUND_PATHS.SEA_NARRATION, SOUND_PATHS.FIELD_NARRATION, SOUND_PATHS.SKY_NARRATION];

    bgAudios.current = bgUrls.map((url) => {
      const a = new Audio(url);
      a.loop = true;
      a.volume = 0.4;
      return a;
    });
    narrationAudios.current = narUrls.map((url) => {
      const a = new Audio(url);
      a.loop = false;
      a.volume = 1.0;
      return a;
    });

    return () => {
      bgAudios.current.forEach((a: HTMLAudioElement) => { a.pause(); a.src = ''; });
      narrationAudios.current.forEach((a: HTMLAudioElement) => { a.pause(); a.src = ''; });
      narrationTimers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
    bgAudios.current.forEach((a: HTMLAudioElement) => { a.muted = isMuted; });
    narrationAudios.current.forEach((a: HTMLAudioElement) => { a.muted = isMuted; });
  }, [isMuted]);

  const playAudio = (index: number) => {
    const bg = bgAudios.current[index];
    const nar = narrationAudios.current[index];
    if (!bg) return;
    bg.play().catch(() => {});
    narrationTimers.current[index] = setTimeout(() => {
      bg.volume = 0.15;
      nar?.play().catch(() => {});
    }, 5000);
  };

  const stopAudio = (index: number) => {
    clearTimeout(narrationTimers.current[index]);
    const bg = bgAudios.current[index];
    const nar = narrationAudios.current[index];
    if (bg) { bg.pause(); bg.currentTime = 0; bg.volume = 0.4; }
    if (nar) { nar.pause(); nar.currentTime = 0; }
  };

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

        // Shared lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);

        const loader = new GLTFLoader();

        // Build all three scenes in parallel
        const [seaScene, fieldScene, skyScene] = await Promise.all([
          buildSeaScene(loader),
          buildFieldScene(loader),
          buildSkyScene(loader),
        ]);

        if (cancelled) return;

        // Attach each scene to its anchor
        // anchor.group is a THREE.Group that MindAR repositions every frame
        // to match the physical marker — this is what makes it true AR
        const scenes = [seaScene, fieldScene, skyScene];
        scenes.forEach(({ group }, i) => {
          const anchor = mindarThree.addAnchor(i);
          anchor.group.add(group);
          anchor.onTargetFound = () => playAudio(i);
          anchor.onTargetLost = () => stopAudio(i);
        });

        setPhase('tracking');
        await mindarThree.start();
        if (cancelled) { try { mindarThree.stop(); } catch { /* */ } return; }

        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.background = 'transparent';

        const clock = new THREE.Clock();
        renderer.setAnimationLoop(() => {
          if (cancelled) return;
          const dt = Math.min(clock.getDelta(), 0.05);
          seaScene.update(dt);
          fieldScene.update(dt);
          skyScene.update(dt);
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
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Mute */}
      <button
        onClick={() => setIsMuted((m: boolean) => !m)}
        className="fixed top-6 right-6 z-50 p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors"
        aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
      >
        {isMuted ? <VolumeX size={20} className="text-red-400" /> : <Volume2 size={20} />}
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

      {phase === 'tracking' && (
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
