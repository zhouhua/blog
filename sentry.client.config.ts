import * as Sentry from '@sentry/astro';

const dsn = 'https://3980dc24dd4a6cbe00ad71338a2f834c@o56440.ingest.us.sentry.io/4508126150656000';

Sentry.init({
  debug: false,
  dsn,
  environment: import.meta.env.PUBLIC_VERCEL_ENV,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  release: import.meta.env.PUBLIC_VERCEL_GIT_COMMIT_SHA,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  tracesSampleRate: 1.0,
});
