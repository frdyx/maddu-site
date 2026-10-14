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
  // Deep reference pages moved into the /docs section — old URLs redirect
  // so external links and search results keep resolving. Portable static
  // meta-refresh pages (work on Loopia/Apache + Cloudflare alike).
  redirects: {
    '/how-it-works': '/docs/how-it-works',
    '/architecture': '/docs/architecture',
    '/governance': '/docs/governance',
    '/hard-rules': '/docs/hard-rules',
    '/security': '/docs/security',
  },
  markdown: {
    // The mirrored corpus is the only markdown we render. Shiki's default
    // theme (github-dark) stamps `background-color:#24292e` INLINE on every
    // <pre>, which beats any stylesheet and paints GitHub grey into a navy
    // site. `css-variables` emits var() references instead, so the code
    // blocks read from the Máddu tokens like everything else — see the
    // --astro-code-* block in tokens.css.
    shikiConfig: { theme: 'css-variables', wrap: false },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    ssr: {
      noExternal: ['mermaid'],
    },
  },
});
