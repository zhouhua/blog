interface NegotiationRoute {
  continue: true;
  middlewarePath: '_markdown';
  middlewareRawSrc: string[];
  src: string;
}

interface VercelOutputConfig {
  routes?: unknown[];
  [key: string]: unknown;
}

export const negotiationRoute: NegotiationRoute = {
  continue: true,
  middlewarePath: '_markdown',
  middlewareRawSrc: ['/:year/:slug', '/:year/:slug.md'],
  src: '^/\\d{4}/[^/.]+(?:\\.md)?$',
};

export function withNegotiationRoute<T extends VercelOutputConfig>(config: T) {
  const routes = Array.isArray(config.routes) ? config.routes : [];
  const withoutExisting = routes.filter((route) => {
    return !(route && typeof route === 'object' && 'middlewarePath' in route && route.middlewarePath === '_markdown');
  });

  return {
    ...config,
    routes: [negotiationRoute, ...withoutExisting],
  };
}
