import { describe, expect, it } from 'vitest';
import { sizeOptions } from './projects';

describe('sizeOptions', () => {
  it('keeps every preset width and height positive', () => {
    for (const option of sizeOptions) {
      expect(option.width).toBeGreaterThan(0);
      expect(option.height).toBeGreaterThan(0);
    }
  });

  it('keeps labelKey values unique', () => {
    const labels = sizeOptions.map(option => option.labelKey);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('assigns every option to a non-empty category', () => {
    for (const option of sizeOptions) {
      expect(option.category.length).toBeGreaterThan(0);
    }
  });
});
