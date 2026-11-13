import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';

// Astro only detects a literal true or false. Leaving this non-literal keeps dev
// on the server output, where Accept is readable, and production static output prerendered.
export const prerender = import.meta.env.PROD;

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({ params: { slug: post.id } }));
}

export const GET: APIRoute = async ({ params }) => {
  const slug = typeof params.slug === 'string' ? params.slug : undefined;
  const post = slug ? await getEntry({ collection: 'blog', id: slug }) : undefined;
  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const body = post.body?.trim() ?? '';
  const markdown = body ? `# ${post.data.title}\n\n${body}\n` : `# ${post.data.title}\n`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
