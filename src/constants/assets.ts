const modelUrl = (fileName: string) => new URL(`../assets/models/${fileName}`, import.meta.url).href;

export const MODEL_PATHS = {
  // Scene 1: Ocean & Floating Object
  FLOATING_OBJECT: modelUrl('field.glb'),
  CLOUD: modelUrl('flower1.glb'),

  // Scene 2: Meadow
  FLOWER: modelUrl('flowers.glb'),
  GRASS: modelUrl('grass.glb'),

  // Scene 3: Flock
  BIRD: modelUrl('bird.glb'),
};
