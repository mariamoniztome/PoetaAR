const modelUrl = (fileName: string) => new URL(`../assets/models/${fileName}`, import.meta.url).href;
const soundUrl = (fileName: string) => new URL(`../assets/sound/${fileName}`, import.meta.url).href;

export const MODEL_PATHS = {
  // Scene 1: Ocean & Floating Object
  FLOATING_OBJECT: modelUrl('lighthouse.glb'),

  // Scene 2: Meadow
  FLOWER: modelUrl('flower1.glb'),

  // Scene 3: Flock
  BIRD: modelUrl('bird.glb'),
};


export const SOUND_PATHS = {
  // Scene 1: Sea
  SEA_BG: soundUrl('poem2.mp3'),
  SEA_NARRATION: '',
  
  // Scene 2: Field
  FIELD_BG: soundUrl('poem1.mp3'),
  FIELD_NARRATION: '',
  
  // Scene 3: Sky
  SKY_BG: soundUrl('poem3.mp3'),
  SKY_NARRATION: '',
};
