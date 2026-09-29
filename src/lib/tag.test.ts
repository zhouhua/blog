import { describe, expect, it } from 'vitest';
import { toTagSlug } from './tag';

describe('toTagSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(toTagSlug('缓动 函数')).toBe('缓动-函数');
  });

  it('replaces slashes with hyphens', () => {
    expect(toTagSlug('foo/bar')).toBe('foo-bar');
  });

  it('collapses mixed whitespace and slashes', () => {
    expect(toTagSlug('A / B')).toBe('a---b');
  });
});
