import process from 'node:process';

export function shouldRunAlgoliaIndex(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV !== 'development' && env.ALGOLIA_INDEX_ON_BUILD === 'true';
}
