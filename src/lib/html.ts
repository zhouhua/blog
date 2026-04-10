import type { GetImageResult, ImageMetadata } from 'astro';
import { load } from 'cheerio';
import { words } from 'es-toolkit/string';

const CJK_WORD_RE = /[\p{sc=Katakana}\p{sc=Hiragana}\p{sc=Han}]/gu;
const MARKDOWN_BLOCK_CODE_RE = /```[\S\s]*?```/g;
const MARKDOWN_HEADING_RE = /^#{1,6}\s+/gm;

// eslint-disable-next-line regexp/strict
const MARKDOWN_IMAGE_RE = /!\[[\S\s]*?]\([\S\s]*?\)/g;
// eslint-disable-next-line regexp/strict
const MARKDOWN_LINK_RE = /\[([\S\s]*?)]\(([\S\s]*?)\)/g;
const MARKDOWN_LIST_RE = /^\s*(?:[*+-]|\d+\.)\s+/gm;
const MARKDOWN_QUOTE_RE = /^>\s?/gm;
const HTML_COMMENT_RE = /<!--[\S\s]*?-->/g;
const HTML_TAG_RE = /<[^>]+>/g;
const MARKDOWN_WHITESPACE_RE = /\s+/g;
const WHITESPACE_RE = /\s+/g;
const imageModules = import.meta.glob<{ default: ImageMetadata }>(`../content/**/*.{jpeg,jpg,png,gif}`);

export function toContentImagePath(path: string) {
  const normalizedPath = path.replaceAll('\\', '/');
  const marker = '/content/';
  const markerIndex = normalizedPath.indexOf(marker);

  if (markerIndex >= 0) {
    return normalizedPath.slice(markerIndex + 1);
  }

  if (normalizedPath.startsWith('content/')) {
    return normalizedPath;
  }

  const srcMarker = 'src/content/';
  const srcIndex = normalizedPath.indexOf(srcMarker);
  if (srcIndex >= 0) {
    return normalizedPath.slice(srcIndex + 'src/'.length);
  }

  return null;
}

export function buildImageIndex<T>(modules: Record<string, T>) {
  const index = new Map<string, T>();

  for (const [key, value] of Object.entries(modules)) {
    const contentPath = toContentImagePath(key);
    if (contentPath) {
      index.set(contentPath, value);
    }
  }

  return index;
}

const imageIndex = buildImageIndex(imageModules);
const imageCache = new Map<string, Promise<ImageMetadata | null>>();

type GalleryImageAsset = GetImageResult | Pick<ImageMetadata, 'src'>;

function getPureText(html: string) {
  const $ = load(html);
  return $(':root').prop('textContent') ?? '';
}

export function getReadInfo(html: string) {
  const $ = load(html);
  const pureText = getPureText(html);
  const cjkWordCount = pureText.match(CJK_WORD_RE)?.length ?? 0;
  // es-toolkit/string#words 不支持 lodash 的第二个正则参数，
  // 所以先把 CJK 字符替换为空格，再用 words 统计非 CJK 单词数。
  const nonCjkText = pureText.replace(CJK_WORD_RE, ' ');
  const wordCount = words(nonCjkText).length + cjkWordCount;
  const imageCount = $('img').length;
  const timeToRead = Math.ceil(wordCount / 275 + imageCount / 12);
  return {
    timeToRead,
    wordCount,
  };
}

export async function getImage(path: string) {
  const imagePath = toContentImagePath(path);
  if (!imagePath) {
    return null;
  }

  const cached = imageCache.get(imagePath);
  if (cached) {
    return cached;
  }

  const loader = imageIndex.get(imagePath);
  if (!loader) {
    return null;
  }

  const imagePromise = loader().then(module => module.default);
  imageCache.set(imagePath, imagePromise);
  return imagePromise;
}

export function getGalleryImageSrc(image: GalleryImageAsset) {
  return image.src;
}

export function getGalleryImageSrcSet(image: GalleryImageAsset) {
  if ('srcSet' in image) {
    return image.srcSet.attribute;
  }

  return undefined;
}

export function getExcerpt(html: string, cut = 140) {
  const pureText = getPureText(html).replace(WHITESPACE_RE, ' ');
  return pureText.slice(0, cut);
}

export function getMarkdownExcerpt(markdown: string, cut = 140) {
  const pureText = markdown
    .replace(MARKDOWN_BLOCK_CODE_RE, ' ')
    .replace(MARKDOWN_IMAGE_RE, ' ')
    .replace(MARKDOWN_LINK_RE, '$1')
    .replace(MARKDOWN_HEADING_RE, '')
    .replace(MARKDOWN_LIST_RE, '')
    .replace(MARKDOWN_QUOTE_RE, '')
    .replace(HTML_COMMENT_RE, ' ')
    .replace(HTML_TAG_RE, ' ')
    .replace(MARKDOWN_WHITESPACE_RE, ' ')
    .trim();

  return pureText.slice(0, cut);
}
