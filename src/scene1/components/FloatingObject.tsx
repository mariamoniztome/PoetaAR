import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useStore } from '../store';
import { MODEL_PATHS } from '../../constants/assets';

export function FloatingObject({ modelUrl = MODEL_PATHS.FLOATING_OBJECT }: { modelUrl?: string }) {
  const debugConfig = useStore((state) => state.debugConfig);
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <group
      position={[
        debugConfig.floatingPosition[0],
        debugConfig.floatingPosition[1] + debugConfig.yOffset,
        debugConfig.floatingPosition[2],
      ]}
      scale={Math.max(debugConfig.floatingScale, 0.001)}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.FLOATING_OBJECT);
