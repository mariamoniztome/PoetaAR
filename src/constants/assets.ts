import flowerGlb from '../assets/models/flower.glb?url';
import lighthouseGlb from '../assets/models/lighthouse.glb?url';
import birdGlb from '../assets/models/bird.glb?url';
import hibiscusGlb from '../assets/models/animation.glb?url';
import grassGlb from '../assets/models/grass.glb?url';
// import realisticGrassGlb from '../assets/models/realistic_grass.glb?url';
import ivyGlb from '../assets/models/ivy.glb?url';
import leopardGlb from '../assets/models/japonicum.glb?url';
import cloverGlb from '../assets/models/clover.glb?url';
import poem1Mp3 from '../assets/sound/poem1.mp3?url';
import poem2Mp3 from '../assets/sound/poem2.mp3?url';
import poem3Mp3 from '../assets/sound/poem3.mp3?url';
import narration1 from '../assets/sound/narration1.mp3?url';
import narration2 from '../assets/sound/narration2.mp3?url';
import narration3 from '../assets/sound/narration3.mp3?url';

export const MODEL_PATHS = {
  // Scene 1
  FLOATING_OBJECT: lighthouseGlb,

  // Scene 2
  FLOWER: flowerGlb,
  HIBISCUS: hibiscusGlb,
  GRASS: grassGlb,
  // REALISTIC_GRASS: realisticGrassGlb,
  IVY: ivyGlb,
  LEOPARD_PLANT: leopardGlb,
  WHITE_CLOVER: cloverGlb,

  // Scene 3
  BIRD: birdGlb,
};

export const SOUND_PATHS = {
  // Scene 1: Sea
  SEA_BG: poem2Mp3,
  SEA_NARRATION: narration2,
  
  // Scene 2: Field
  FIELD_BG: poem1Mp3,
  FIELD_NARRATION: narration3,
  
  // Scene 3: Sky
  SKY_BG: poem3Mp3,
  SKY_NARRATION: narration1,
};
