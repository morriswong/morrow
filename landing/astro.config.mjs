import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://morriswong.github.io',
  base: '/morrow',
  outDir: 'dist',
  build: {
    assets: '_assets',
  },
});
