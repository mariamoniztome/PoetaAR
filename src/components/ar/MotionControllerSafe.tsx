import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

interface Props {
  addEnergy: (amount: number) => void;
  updateEnergy: (delta: number) => void;
}

export function MotionControllerSafe({ addEnergy, updateEnergy }: Props) {
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) addEnergy(0.5);
    };
    const handleMouseMove = (e: MouseEvent) => {
      const movement = Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
      addEnergy(movement * 0.0005);
    };
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [addEnergy]);

  useFrame((_, delta) => {
    updateEnergy(delta);
  });

  return null;
}
