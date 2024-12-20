import type { MarkdownInstance } from 'astro';
import process from 'node:process';
import { algoliasearch } from 'algoliasearch';
import { getCollection } from 'astro:content';
import crypto from 'crypto-js';
import { chunk, omit } from 'lodash-es';
import { getExcerpt } from './html';

function MD5(str: string) {
  return crypto.MD5(str).toString();
}

const indexName = 'blog';

export async function algolia(): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  const client = algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID || '', process.env.ALGOLIA_ADMIN_KEY || '');
  const records: Record<string, any>[] = [];
  const tags: {
    name: string;
    count: number;
  }[] = [];
  const blogs = import.meta.glob<MarkdownInstance<any>>('../content/blog/**/*.md', { eager: true });
  for (const key of Object.keys(blogs)) {
    const blog = blogs[key]!;
    const slug = key.replace('../content/blog', '').replace('.md', '');
    records.push({
      date: blog.frontmatter.date,
      headings: blog.getHeadings().map(heading => omit(heading, ['slug'])),
      layout: 'post',
      objectID: MD5(slug),
      slug,
      tags: blog.frontmatter.tags || [],
      text: getExcerpt(await blog.compiledContent(), 2 * 1024),
      title: blog.frontmatter.title,
    });
    for (const tag of blog.frontmatter.tags || []) {
      const index = tags.findIndex(item => item.name === tag);
      if (index === -1) {
        tags.push({
          count: 1,
          name: tag,
        });
      }
      else {
        tags[index]!.count++;
      }
    }
  }

  tags.forEach(({ count, name }) => {
    const slug = `/tag/${name.replace(/\s+|\//g, '-').toLowerCase()}`;
    records.push({
      count,
      layout: 'tag',
      objectID: MD5(slug),
      slug,
      title: `标签 🏷️ ${name}`,
    });
  });

  const journals = import.meta.glob<MarkdownInstance<any>>('../content/journals/**/*.md', { eager: true });
  for (const key of Object.keys(journals)) {
    const journal = journals[key]!;
    const date = key.replace('../content/journals/', '').replace('.md', '').replace('/', '-');
    const slug = `/journals/#${date}`;
    records.push({
      date,
      headings: journal.getHeadings().map(heading => omit(heading, ['slug'])),
      layout: 'journal',
      objectID: MD5(slug),
      slug,
      tags: [],
      text: getExcerpt(await journal.compiledContent(), 2 * 1024),
      title: `随笔 🗓️ ${date}`,
    });
  }

  const photos = await getCollection('photos');
  for (const photo of photos) {
    const slug = `/photo/${photo.id.replace('/index', '')}`;
    records.push({
      date: photo.data.date,
      layout: 'photo',
      objectID: MD5(slug),
      slug,
      text: photo.data.list.map((item: { description: string }) => item.description).join('\n'),
      title: photo.data.title,
    });
  }
  for (const objects of chunk(records, 20)) {
    try {
      await client.saveObjects({ indexName, objects });
    }
    catch (e) {
      console.error(e);
      console.log(objects);
    }
  }
}
