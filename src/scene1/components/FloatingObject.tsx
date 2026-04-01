import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { MODEL_PATHS } from '../../constants/assets';

export function FloatingObject({ modelUrl = MODEL_PATHS.FLOATING_OBJECT }: { modelUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load model and animations
  const { scene, animations } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { actions } = useAnimations(animations, groupRef);

  // Play first animation if available
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) firstAction.play();
    }
  }, [actions]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const energy = useStore.getState().energy;
    
    // Floating physics
    const baseHeight = Math.sin(t * 0.5) * (0.5 + energy * 1.5) * 0.5;
    const detailHeight = Math.sin(t * 1.2) * (0.1 + energy * 0.5) * 0.5;
    const targetY = baseHeight + detailHeight - 1.2;
    
    // Gentle rocking
    const targetRotX = Math.sin(t * 0.8) * (0.1 + energy * 0.3);
    const targetRotZ = Math.cos(t * 0.6) * (0.1 + energy * 0.3);

    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 0.05);
    
    // Adjust animation speed based on energy
    if (actions && Object.values(actions)[0]) {
      const action = Object.values(actions)[0];
      if (action) action.timeScale = 1 + energy;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.FLOATING_OBJECT);
