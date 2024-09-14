declare module '*.module.css' {
  const classes: Record<string, string>;
  export = classes;
}
declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}

type ColorMode = 'light' | 'dark';

type GtagEvent = 'open_search_box' | 'search_query' | 'search_hit';

declare interface Window {
  gtag: (type: 'event', name: GtagEvent, data?: unknown) => void;
}
