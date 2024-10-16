import type { ImageMetadata, MarkdownInstance } from 'astro';
import { load } from 'cheerio';
import { words } from 'lodash-es';

export function getEntry(id: string) {
  const posts = import.meta.glob<MarkdownInstance<any>>(`../content/**/*.md`, { eager: true });
  for (const key of Object.keys(posts)) {
    if (key.endsWith(id)) {
      return posts[key];
    }
  }
  return null;
}

export function getReadInfo(html: string) {
  const $ = load(html);
  const pureText = $(':root').text();
  const wordCount = words(pureText).length
    + words(pureText, /[\p{sc=Katakana}\p{sc=Hiragana}\p{sc=Han}]/gu).length;
  const imageCount = $('img').length;
  const timeToRead = Math.ceil(wordCount / 275 + imageCount / 12);
  return {
    timeToRead,
    wordCount,
  };
}

export function getImage(path: string) {
  const images = import.meta.glob<{ default: ImageMetadata }>(`../content/**/*.{jpeg,jpg,png,gif}`, { eager: true });
  for (const key of Object.keys(images)) {
    if (key.endsWith(path)) {
      return images[key]!.default;
    }
  }
  return null;
}

export function getExcerpt(html: string, cut = 140) {
  const $ = load(html);
  const pureText = $(':root').text().replace(/\s+/g, ' ');
  return pureText.slice(0, cut);
}
