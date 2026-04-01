import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';

export function MotionControllerSafe() {
  const addEnergy = useStore((state) => state.addEnergy);
  const updateEnergy = useStore((state) => state.updateEnergy);

  useEffect(() => {
    // Simple touch-based energy system that won't cause white screen
    const handleTouchMove = (e: TouchEvent) => {
      try {
        if (e.touches.length > 0) {
          console.log('Touch movement detected');
          addEnergy(0.5);
        }
      } catch (error) {
        console.error('Error in touch handler:', error);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      try {
        const movement = Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
        addEnergy(movement * 0.0005);
      } catch (error) {
        console.error('Error in mouse handler:', error);
      }
    };

    // Only add safe event listeners
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mousemove', handleMouseMove);
    
    console.log('Safe motion controller initialized');

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [addEnergy]);

  useFrame((state, delta) => {
    updateEnergy(delta);
  });

  return null; // No UI component, just logic
}
