import { describe, expect, it } from 'vitest';
import {
  base62,
  createLinkKey,
  isAllowedRedirectUrl,
  isUniqueViolation,
} from './_utils';

const ALPHANUMERIC_RE = /^[\da-z]+$/i;

describe('base62', () => {
  it('returns an empty string for zero', () => {
    expect(base62(0)).toBe('');
  });

  it('encodes single-digit values with the digit alphabet', () => {
    expect(base62(1)).toBe('1');
    expect(base62(10)).toBe('a');
    expect(base62(61)).toBe('Z');
  });

  it('encodes values that need more than one digit', () => {
    expect(base62(62)).toBe('10');
    expect(base62(63)).toBe('11');
  });
});

describe('isAllowedRedirectUrl', () => {
  it('accepts http and https urls', () => {
    expect(isAllowedRedirectUrl('https://example.com/a')).toBe(true);
    expect(isAllowedRedirectUrl('http://example.com')).toBe(true);
  });

  it('rejects javascript and data schemes', () => {
    expect(isAllowedRedirectUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedRedirectUrl('data:text/html,hi')).toBe(false);
  });

  it('rejects non-urls', () => {
    expect(isAllowedRedirectUrl('not-a-url')).toBe(false);
  });
});

describe('createLinkKey', () => {
  it('returns a stable alphanumeric key for the same input', () => {
    const a = createLinkKey('https://example.com');
    const b = createLinkKey('https://example.com');
    expect(a).toBe(b);
    expect(a).toMatch(ALPHANUMERIC_RE);
  });

  it('changes key when padding is added after a collision', () => {
    const base = createLinkKey('https://example.com');
    const padded = createLinkKey('https://example.com ');
    expect(padded).not.toBe(base);
  });
});

describe('isUniqueViolation', () => {
  it('detects postgres unique_violation code', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
    expect(isUniqueViolation({ code: '42P01' })).toBe(false);
    expect(isUniqueViolation(new Error('x'))).toBe(false);
  });
});
