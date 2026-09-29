import { describe, expect, it } from 'vitest';
import {
  createLinkSchema,
  deleteLinkSchema,
  getLinkSchema,
} from './_schemas';

describe('createLinkSchema', () => {
  it('accepts a trimmed absolute url', () => {
    const result = createLinkSchema.safeParse({ value: '  https://example.com/a  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe('https://example.com/a');
    }
  });

  it('rejects an empty value', () => {
    const result = createLinkSchema.safeParse({ value: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-url string', () => {
    const result = createLinkSchema.safeParse({ value: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});

describe('deleteLinkSchema', () => {
  it('accepts alphanumeric keys', () => {
    expect(deleteLinkSchema.safeParse({ key: 'Ab12' }).success).toBe(true);
  });

  it('rejects keys with punctuation', () => {
    expect(deleteLinkSchema.safeParse({ key: 'ab-12' }).success).toBe(false);
  });

  it('rejects empty keys', () => {
    expect(deleteLinkSchema.safeParse({ key: '' }).success).toBe(false);
  });
});

describe('getLinkSchema', () => {
  it('mirrors deleteLinkSchema key rules', () => {
    expect(getLinkSchema.safeParse({ key: 'z9' }).success).toBe(true);
    expect(getLinkSchema.safeParse({ key: 'z_9' }).success).toBe(false);
  });
});
