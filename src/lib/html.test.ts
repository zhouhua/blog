import { describe, expect, it } from 'vitest';
import {
  buildImageIndex,
  getGalleryImageSrc,
  getGalleryImageSrcSet,
  getMarkdownExcerpt,
  toContentImagePath,
} from './html';

describe('toContentImagePath', () => {
  it('normalizes supported content image paths', () => {
    expect(toContentImagePath('src/content/photos/2020/10-10/path.jpg')).toBe('content/photos/2020/10-10/path.jpg');
    expect(toContentImagePath('/tmp/project/src/content/blog/2022/foo.png')).toBe('content/blog/2022/foo.png');
    expect(toContentImagePath('content/journals/2022/images/a.jpeg')).toBe('content/journals/2022/images/a.jpeg');
  });

  it('returns null for unsupported paths', () => {
    expect(toContentImagePath('src/assets/logo.png')).toBeNull();
  });
});

describe('buildImageIndex', () => {
  it('indexes glob entries by normalized content path', () => {
    const imageA = () => Promise.resolve({ default: { width: 100 } as never });
    const imageB = () => Promise.resolve({ default: { width: 200 } as never });
    const index = buildImageIndex({
      '../content/blog/2022/foo.png': imageA,
      '../content/photos/2020/bar.jpg': imageB,
    });

    expect(index.get('content/blog/2022/foo.png')).toBe(imageA);
    expect(index.get('content/photos/2020/bar.jpg')).toBe(imageB);
  });
});

describe('getMarkdownExcerpt', () => {
  it('strips common markdown syntax for previews', () => {
    const markdown = `
# Title

> quoted text

1. first item
2. second item

![alt](./image.png)

[link text](https://example.com)

\`\`\`ts
const hidden = true;
\`\`\`
`;

    expect(getMarkdownExcerpt(markdown, 200)).toContain('Title');
    expect(getMarkdownExcerpt(markdown, 200)).toContain('quoted text');
    expect(getMarkdownExcerpt(markdown, 200)).toContain('link text');
    expect(getMarkdownExcerpt(markdown, 200)).not.toContain('![alt]');
    expect(getMarkdownExcerpt(markdown, 200)).not.toContain('```');
  });

  it('strips inline html tags and comments', () => {
    const markdown = `
<p>Hello <strong>world</strong></p>
<!-- hidden -->
<div>Visible text</div>
`;

    const excerpt = getMarkdownExcerpt(markdown, 200);
    expect(excerpt).toContain('Hello world');
    expect(excerpt).toContain('Visible text');
    expect(excerpt).not.toContain('<strong>');
    expect(excerpt).not.toContain('hidden');
  });
});

describe('gallery image helpers', () => {
  it('reads src and srcSet from transformed images', () => {
    const transformed = {
      src: '/_astro/photo.webp',
      srcSet: {
        attribute: '/_astro/photo.webp 1x, /_astro/photo@2x.webp 2x',
      },
    } as never;

    expect(getGalleryImageSrc(transformed)).toBe('/_astro/photo.webp');
    expect(getGalleryImageSrcSet(transformed)).toBe('/_astro/photo.webp 1x, /_astro/photo@2x.webp 2x');
  });

  it('falls back to original metadata when no responsive variants exist', () => {
    const image = {
      src: '/_astro/photo.jpg',
    } as never;

    expect(getGalleryImageSrc(image)).toBe('/_astro/photo.jpg');
    expect(getGalleryImageSrcSet(image)).toBeUndefined();
  });
});
