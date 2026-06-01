import { defineConfig } from 'astro/config';

// Máddu landing site — static output, no SSR.
// Mermaid renders client-side; runtime dep loaded only on diagram pages.
export default defineConfig({
  site: 'https://maddu.dev',
  output: 'static',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    ssr: {
      noExternal: ['mermaid'],
    },
  },
});
