import { useStore } from '../scene3/store';

export function EnergyDebug() {
  const energy = useStore((state) => state.energy);
  const targetEnergy = useStore((state) => state.targetEnergy);

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 font-mono text-sm">
      <div>Energy: {energy.toFixed(3)}</div>
      <div>Target: {targetEnergy.toFixed(3)}</div>
      <div className="mt-2">
        <div className="w-32 h-2 bg-gray-700 rounded">
          <div 
            className="h-full bg-green-500 rounded transition-all duration-300"
            style={{ width: `${energy * 100}%` }}
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Move o rato/telemóvel para aumentar energia
      </div>
    </div>
  );
}
