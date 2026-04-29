import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

// MindAR v1.2.5 imports `sRGBEncoding` from three, which was removed in r152.
// This plugin patches the file before Rollup's linker sees it, replacing it
// with `SRGBColorSpace` (valid in Three.js 0.183). The value ends up assigned
// to `renderer.outputEncoding`, which was also removed, so it is a no-op.
const mindARThreeCompat: Plugin = {
  name: 'mind-ar-three-compat',
  transform(code, id) {
    if (!id.includes('mindar-image-three.prod.js')) return null;
    return { code: code.replace('sRGBEncoding', 'SRGBColorSpace'), map: null };
  },
};

export default defineConfig(() => {
  return {
    plugins: [mindARThreeCompat, react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      exclude: ['mind-ar'],
    },
    server: {
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
