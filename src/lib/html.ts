import type { ImageMetadata } from 'astro';
import { load } from 'cheerio';
import { words } from 'lodash-es';

const CJK_WORD_RE = /[\p{sc=Katakana}\p{sc=Hiragana}\p{sc=Han}]/gu;
const WHITESPACE_RE = /\s+/g;

function getPureText(html: string) {
  const $ = load(html);
  return $(':root').prop('textContent') ?? '';
}

export function getReadInfo(html: string) {
  const $ = load(html);
  const pureText = getPureText(html);
  const wordCount = words(pureText).length
    + words(pureText, CJK_WORD_RE).length;
  const imageCount = $('img').length;
  const timeToRead = Math.ceil(wordCount / 275 + imageCount / 12);
  return {
    timeToRead,
    wordCount,
  };
}

export function getImage(path: string) {
  const i = path.indexOf('content');
  const imagePath = path.slice(i);
  const images = import.meta.glob<{ default: ImageMetadata }>(`../content/**/*.{jpeg,jpg,png,gif}`, { eager: true });
  for (const key of Object.keys(images)) {
    if (key.endsWith(imagePath)) {
      return images[key]!.default;
    }
  }
  return null;
}

export function getExcerpt(html: string, cut = 140) {
  const pureText = getPureText(html).replace(WHITESPACE_RE, ' ');
  return pureText.slice(0, cut);
}
