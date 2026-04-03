import type { MarkdownInstance } from 'astro';
import process from 'node:process';
import { algoliasearch } from 'algoliasearch';
import crypto from 'crypto-js';
import { chunk } from 'es-toolkit/array';
import { omit } from 'es-toolkit/object';
import { shouldRunAlgoliaIndex } from './algolia-utils';
import { getExcerpt } from './html';
import { appLogger } from './logger';

function MD5(str: string) {
  return crypto.MD5(str).toString();
}

const indexName = 'blog';
const TAG_SLUG_RE = /\s+|\//g;

export async function algolia(): Promise<void> {
  if (!shouldRunAlgoliaIndex()) {
    return;
  }
  const client = algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID || '', process.env.ALGOLIA_ADMIN_KEY || '');
  const records: Record<string, any>[] = [];
  const tags: {
    name: string;
    count: number;
  }[] = [];
  const blogs = import.meta.glob<MarkdownInstance<any>>('../content/blog/**/*.md');
  for (const key of Object.keys(blogs)) {
    const blog = await blogs[key]!();
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
    const slug = `/tag/${name.replace(TAG_SLUG_RE, '-').toLowerCase()}`;
    records.push({
      count,
      layout: 'tag',
      objectID: MD5(slug),
      slug,
      title: `标签 🏷️ ${name}`,
    });
  });

  const journals = import.meta.glob<MarkdownInstance<any>>('../content/journals/**/*.md');
  for (const key of Object.keys(journals)) {
    const journal = await journals[key]!();
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

  for (const objects of chunk(records, 20)) {
    try {
      await client.saveObjects({ indexName, objects });
    }
    catch (error) {
      appLogger.error('Failed to save Algolia objects', error, {
        count: objects.length,
        firstObject: objects[0],
      });
    }
  }
}
