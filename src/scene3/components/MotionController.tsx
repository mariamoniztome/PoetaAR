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
      try {
        const hasDeviceMotion = 'DeviceMotionEvent' in window;
        const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
        console.log('Motion support check:', JSON.stringify({ hasDeviceMotion, hasDeviceOrientation }));
        return hasDeviceMotion || hasDeviceOrientation;
      } catch (error) {
        console.error('Error checking motion support:', error);
        return false;
      }
    };

    if (!checkMotionSupport()) {
      console.log('Device motion/orientation not supported');
      setMotionPermission('denied');
      return;
    }

    const requestMotionPermission = async () => {
      try {
        console.log('Requesting motion permission...');
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          try {
            const permission = await (DeviceMotionEvent as any).requestPermission();
            console.log('Motion permission result:', permission);
            setMotionPermission(permission);
            setShowPermissionPrompt(false);
          } catch (error) {
            console.error('Error requesting device motion permission:', error);
            setMotionPermission('denied');
            setShowPermissionPrompt(false);
          }
        } else {
          console.log('Motion permission not required (non-iOS or already granted)');
          setMotionPermission('granted');
          setShowPermissionPrompt(false);
        }
      } catch (error) {
        console.error('Unexpected error in requestMotionPermission:', error);
        setMotionPermission('denied');
        setShowPermissionPrompt(false);
      }
    };

    // Auto-request permission on mount
    if (motionPermission === 'prompt') {
      console.log('Auto-requesting motion permission...');
      requestMotionPermission();
    }

    const handleMouseMove = (e: MouseEvent) => {
      const movement = Math.abs(e.movementX) + Math.abs(e.movementY);
      addEnergy(movement * 0.0005);
    };

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      console.log('Device motion event:', JSON.stringify(e.rotationRate));
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
        
        console.log('Device orientation movement:', movement);
        if (movement > 1) {
          addEnergy(movement * 0.002);
        }
        
        setLastOrientation({ alpha: e.alpha, beta: e.beta, gamma: e.gamma });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        // Touch doesn't have movementX/movementY, so we'll add energy based on touch presence
        console.log('Touch movement detected');
        addEnergy(0.5);
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
    console.log('Mouse event listener added');
    
    if (motionPermission !== 'denied') {
      window.addEventListener('devicemotion', handleDeviceMotion);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      console.log('Device motion and orientation event listeners added');
    }
    
    // Always add touch events as fallback
    window.addEventListener('touchmove', handleTouchMove);
    console.log('Touch move event listener added');
    
    if (motionPermission === 'prompt') {
      window.addEventListener('click', handleUserInteraction);
      window.addEventListener('touchstart', handleUserInteraction);
      console.log('User interaction listeners added for permission prompt');
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('touchmove', handleTouchMove);
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
