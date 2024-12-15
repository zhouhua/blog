/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type ColorMode = 'dark' | 'light';

type GtagEvent = 'open_search_box' | 'search_hit' | 'search_query';

declare interface Window {
  gtag: (type: 'event', name: GtagEvent, data?: unknown) => void;
}
