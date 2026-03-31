import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';

export function MotionController() {
  const addEnergy = useStore((state) => state.addEnergy);
  const updateEnergy = useStore((state) => state.updateEnergy);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const movement = Math.abs(e.movementX) + Math.abs(e.movementY);
      addEnergy(movement * 0.0005);
    };

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (e.rotationRate) {
        const movement = 
          Math.abs(e.rotationRate.alpha || 0) + 
          Math.abs(e.rotationRate.beta || 0) + 
          Math.abs(e.rotationRate.gamma || 0);
        addEnergy(movement * 0.005);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('devicemotion', handleDeviceMotion);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [addEnergy]);

  useFrame((state, delta) => {
    updateEnergy(delta);
  });

  return null;
}
