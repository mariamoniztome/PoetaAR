import flowerGlb from '../assets/models/flower.glb?url';
import lighthouseGlb from '../assets/models/lighthouse.glb?url';
import birdGlb from '../assets/models/bird.glb?url';
import poem1Mp3 from '../assets/sound/poem1.mp3?url';
import poem2Mp3 from '../assets/sound/poem2.mp3?url';
import poem3Mp3 from '../assets/sound/poem3.mp3?url';

export const MODEL_PATHS = {
  // Scene 1: Ocean & Floating Object
  FLOATING_OBJECT: lighthouseGlb,

  // Scene 2: Meadow
  FLOWER: flowerGlb,

  // Scene 3: Flock
  BIRD: birdGlb,
};

export const SOUND_PATHS = {
  // Scene 1: Sea
  SEA_BG: poem2Mp3,
  SEA_NARRATION: '',
  
  // Scene 2: Field
  FIELD_BG: poem1Mp3,
  FIELD_NARRATION: '',
  
  // Scene 3: Sky
  SKY_BG: poem3Mp3,
  SKY_NARRATION: '',
};
