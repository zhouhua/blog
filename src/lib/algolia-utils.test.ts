import { describe, expect, it } from 'vitest';
import { shouldRunAlgoliaIndex } from './algolia-utils';

describe('shouldRunAlgoliaIndex', () => {
  it('skips indexing in development', () => {
    expect(shouldRunAlgoliaIndex({
      ALGOLIA_INDEX_ON_BUILD: 'true',
      NODE_ENV: 'development',
    })).toBe(false);
  });

  it('requires explicit opt-in in production', () => {
    expect(shouldRunAlgoliaIndex({
      NODE_ENV: 'production',
    })).toBe(false);
    expect(shouldRunAlgoliaIndex({
      ALGOLIA_INDEX_ON_BUILD: 'true',
      NODE_ENV: 'production',
    })).toBe(true);
  });
});
