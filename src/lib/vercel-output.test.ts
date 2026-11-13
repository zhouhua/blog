import { describe, expect, it } from 'vitest';
import { withNegotiationRoute } from './vercel-output';

describe('withNegotiationRoute', () => {
  it('puts the markdown negotiation route ahead of existing routes', () => {
    const config = withNegotiationRoute({
      routes: [{ handle: 'filesystem' }],
      version: 3,
    });

    expect(config.version).toBe(3);
    expect(config.routes[0]).toMatchObject({
      continue: true,
      middlewarePath: '_markdown',
    });
    expect(config.routes[1]).toEqual({ handle: 'filesystem' });
  });

  it('replaces an existing negotiation route instead of stacking it', () => {
    const config = withNegotiationRoute({
      routes: [{ middlewarePath: '_markdown' }, { handle: 'filesystem' }],
    });

    const attached = config.routes.filter((route) => {
      return typeof route === 'object' && route !== null && 'middlewarePath' in route && route.middlewarePath === '_markdown';
    });
    expect(attached).toHaveLength(1);
  });
});
