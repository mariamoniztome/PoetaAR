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


export const SOUND_PATHS = {
  // Scene 1: Sea
  SEA_BG: '/assets/sound/poem1.mp3',
  SEA_NARRATION: '/assets/sound/sea_narration.mp3',
  
  // Scene 2: Field
  FIELD_BG: '/assets/sound/poem2.mp3',
  FIELD_NARRATION: '/assets/sound/field_narration.mp3',
  
  // Scene 3: Sky
  SKY_BG: '/assets/sound/poem3.mp3',
  SKY_NARRATION: '/assets/sound/sky_narration.mp3',
};
