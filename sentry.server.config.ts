import * as Sentry from '@sentry/astro';

const dsn = 'https://3980dc24dd4a6cbe00ad71338a2f834c@o56440.ingest.us.sentry.io/4508126150656000';

Sentry.init({
  debug: false,
  dsn,
  environment: import.meta.env.PUBLIC_VERCEL_ENV,
  release: import.meta.env.PUBLIC_VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: 1.0,
});
