/**
 * Centralized paths for 3D models.
 * Replace these paths with your actual .glb or .gltf files.
 * Example: '/assets/models/flower.glb'
 */

export const MODEL_PATHS = {
  // Scene 1: Ocean & Floating Object
  // Using a public URL as an example. Replace with your own URL or local path.
  FLOATING_OBJECT: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/book/model.gltf',
  CLOUD: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/cloud/model.gltf',
  
  // Scene 2: Meadow
  FLOWER: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/sunflower/model.gltf',
  GRASS: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/grass/model.gltf',
  
  // Scene 3: Flock
  BIRD: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/pigeon/model.gltf',
};

export const SOUND_PATHS = {
  // Scene 1: Sea
  SEA_BG: '/assets/sound/sea_background.mp3',
  SEA_NARRATION: '/assets/sound/sea_narration.mp3',
  
  // Scene 2: Field
  FIELD_BG: '/assets/sound/field_background.mp3',
  FIELD_NARRATION: '/assets/sound/field_narration.mp3',
  
  // Scene 3: Sky
  SKY_BG: '/assets/sound/sky_background.mp3',
  SKY_NARRATION: '/assets/sound/sky_narration.mp3',
};
