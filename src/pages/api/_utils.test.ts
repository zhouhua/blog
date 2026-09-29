import { describe, expect, it } from 'vitest';
import { base62 } from './_utils';

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
