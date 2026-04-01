import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import { MotionPermissionPrompt } from '../../components/MotionPermissionPrompt';

export function MotionController() {
  const addEnergy = useStore((state) => state.addEnergy);
  const updateEnergy = useStore((state) => state.updateEnergy);
  const [motionPermission, setMotionPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [lastOrientation, setLastOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  useEffect(() => {
    const checkMotionSupport = () => {
      const hasDeviceMotion = 'DeviceMotionEvent' in window;
      const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
      return hasDeviceMotion || hasDeviceOrientation;
    };

    if (!checkMotionSupport()) {
      console.log('Device motion/orientation not supported');
      setMotionPermission('denied');
      return;
    }

    const requestMotionPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          setMotionPermission(permission);
          setShowPermissionPrompt(false);
        } catch (error) {
          console.error('Error requesting device motion permission:', error);
          setMotionPermission('denied');
          setShowPermissionPrompt(false);
        }
      } else {
        setMotionPermission('granted');
        setShowPermissionPrompt(false);
      }
    };

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

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
        const movement = 
          Math.abs(e.alpha - lastOrientation.alpha) + 
          Math.abs(e.beta - lastOrientation.beta) + 
          Math.abs(e.gamma - lastOrientation.gamma);
        
        if (movement > 1) {
          addEnergy(movement * 0.002);
        }
        
        setLastOrientation({ alpha: e.alpha, beta: e.beta, gamma: e.gamma });
      }
    };

    const handleUserInteraction = () => {
      if (motionPermission === 'prompt') {
        setShowPermissionPrompt(true);
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('touchstart', handleUserInteraction);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    if (motionPermission !== 'denied') {
      window.addEventListener('devicemotion', handleDeviceMotion);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    
    if (motionPermission === 'prompt') {
      window.addEventListener('click', handleUserInteraction);
      window.addEventListener('touchstart', handleUserInteraction);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [addEnergy, motionPermission, lastOrientation]);

  useFrame((state, delta) => {
    updateEnergy(delta);
  });

  return (
    <>
      <MotionPermissionPrompt
        isVisible={showPermissionPrompt}
        onRequestPermission={async () => {
          if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            try {
              const permission = await (DeviceMotionEvent as any).requestPermission();
              setMotionPermission(permission);
              setShowPermissionPrompt(false);
            } catch (error) {
              console.error('Error requesting device motion permission:', error);
              setMotionPermission('denied');
              setShowPermissionPrompt(false);
            }
          } else {
            setMotionPermission('granted');
            setShowPermissionPrompt(false);
          }
        }}
      />
    </>
  );
}
