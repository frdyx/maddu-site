// Content collections. The `docs` collection is the generated mirror of the
// framework's real docs corpus — written by scripts/gen-docs.mjs, committed,
// and never hand-edited. Edit the doc in the framework repo and re-run
// `npm run docs`.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    /** Route slug under /docs/reference — may contain a subdirectory segment. */
    slug: z.string(),
    /** Sidebar group label. */
    group: z.string(),
    /** Position within the group. */
    order: z.number(),
    description: z.string(),
    /** Path of the source file inside the framework repo's docs/ tree. */
    sourceFile: z.string(),
    /** Canonical source on GitHub — every mirrored page links back to it. */
    sourceUrl: z.string(),
    /** The capability verb this doc is the deep-dive for, when there is one. */
    verb: z.string().optional(),
  }),
});

export const collections = { docs };
