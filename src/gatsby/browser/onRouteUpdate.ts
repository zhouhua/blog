import type { GatsbyBrowser } from 'gatsby';

const onRouteUpdate: GatsbyBrowser['onRouteUpdate'] = ({ location }) => {
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => {
      // @ts-ignore
      if (typeof window.gtag === 'function') {
        // @ts-ignore
        window.gtag('event', 'page_view', { page_path: location.href });
      }
    }, 100);
  }
};

export default onRouteUpdate;
