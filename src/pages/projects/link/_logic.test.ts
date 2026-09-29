import { describe, expect, it } from 'vitest';
import { buildShortUrl, isApiSuccess } from './_logic';

describe('buildShortUrl', () => {
  it('joins origin and key under the /i/ prefix', () => {
    expect(buildShortUrl('https://zhouhua.site', 'abc')).toBe('https://zhouhua.site/i/abc');
  });
});

describe('isApiSuccess', () => {
  it('treats code 0 as success', () => {
    expect(isApiSuccess(0)).toBe(true);
  });

  it('rejects non-zero codes', () => {
    expect(isApiSuccess(1)).toBe(false);
    expect(isApiSuccess(undefined)).toBe(false);
  });
});
