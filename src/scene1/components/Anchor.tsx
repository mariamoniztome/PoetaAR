import { ARModelAnchor } from '../../components/ar/ARModelAnchor';
import { MODEL_PATHS } from '../../constants/assets';

export function Anchor() {
  return (
    <ARModelAnchor
      targetIndex={0}
      modelUrl={MODEL_PATHS.FLOATING_OBJECT}
      modelScale={0.206}
      initialPos={[0, -1.170, 0]}
    />
  );
}
