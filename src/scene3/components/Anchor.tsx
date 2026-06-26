import { ARModelAnchor } from '../../components/ar/ARModelAnchor';
import { MODEL_PATHS } from '../../constants/assets';

export function Anchor() {
  return (
    <ARModelAnchor
      targetIndex={2}
      modelUrl={MODEL_PATHS.BIRD}
      modelScale={3}
    />
  );
}
