import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**\/[^_]*.md' }),
  schema: z.object({
    category: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    // excerpt: z.string(),
    featured: z.boolean().optional(),
    hero: z.string(),
    tags: z.array(z.string()),
    title: z.string(),
    type: z.string().optional(),
  }),
});

const photos = defineCollection({
  loader: glob({ base: './src/content/photos', pattern: '**\/[^_]*.yaml' }),
  schema: z.object({
    date: z.coerce.date(),
    list: z.array(z.object({
      description: z.string(),
      featured: z.boolean().optional(),
      picture: z.string(),
    })),
    title: z.string(),
    type: z.string().optional(),
  }),
});

const journals = defineCollection({
  loader: glob({ base: './src/content/journals', pattern: '**\/[^_]*.md' }),
  schema: z.object({
    date: z.coerce.date(),
    type: z.string().optional(),
  }),
});

const projects = defineCollection({
  schema: z.object({
    description: z.string(),
    link: z.string().url(),
    name: z.string(),
    type: z.string(),
  }),
  type: 'content',
});

export const collections = { blog, journals, photos, projects };
