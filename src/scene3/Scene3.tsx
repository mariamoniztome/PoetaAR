import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { ARScene } from './components/ARScene';
import { useStore } from './store';

const store = createXRStore();

interface Scene3Props {
  title?: string;
  description?: string;
}

export default function Scene3({ 
  title = "Céu Aberto", 
  description = "Mexe o rato ou o telemóvel para desorganizar o bando de pássaros." 
}: Scene3Props) {
  const energy = useStore((state) => state.energy);

  const handleEnterAR = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          console.log('Device motion permission granted');
        }
      } catch (error) {
        console.error('Error requesting device motion permission:', error);
      }
    }
    store.enterAR();
  };

  return (
    <div className="w-full h-full bg-sky-900 relative overflow-hidden font-sans">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex flex-col items-center justify-center text-white text-center">
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2 drop-shadow-lg">
          {title}
        </h1>
        <p className="text-sm opacity-80 max-w-md drop-shadow-md">
          {description}
        </p>
        
        {/* Wind Energy Indicator */}
        <div className="w-48 h-1 bg-white/20 mt-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-sky-400 transition-all duration-100 ease-out"
            style={{ width: `${energy * 100}%` }}
          />
        </div>
      </div>

      {/* AR Button Container */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center z-10">
        <button 
          onClick={handleEnterAR}
          className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full uppercase tracking-wider text-sm hover:bg-white/20 transition-colors pointer-events-auto cursor-pointer"
        >
          Entrar em AR
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 60 }}>
        <XR store={store}>
          <ARScene />
        </XR>
      </Canvas>
    </div>
  );
}
