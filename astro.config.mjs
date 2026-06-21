import { defineConfig } from 'astro/config';

// Máddu landing site — static output, no SSR.
// Mermaid renders client-side; runtime dep loaded only on diagram pages.
export default defineConfig({
  // Overridable for sub-path hosting (e.g. Loopia frdyx.com/maddu).
  // Defaults preserve the canonical maddu.frdyx.com / root Cloudflare build.
  site: process.env.MADDU_SITE || 'https://maddu.frdyx.com',
  base: process.env.MADDU_BASE || '/',
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
