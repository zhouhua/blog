import type { GatsbyBrowser } from 'gatsby';

const shouldUpdateScroll: GatsbyBrowser['shouldUpdateScroll'] = ({
  routerProps,
  prevRouterProps,
  getSavedScrollPosition
}) => {
  const currentPosition = getSavedScrollPosition(routerProps.location);
  const topOfPage: [number, number] = [0, 0];
  // @ts-ignore
  if (routerProps.location.action === 'POP' && currentPosition) {
    setTimeout(() => {
      window.scrollTo(...currentPosition);
    }, 1000);
  } else {
    const hash = window.decodeURIComponent(routerProps.location.hash);
    if (hash) {
      setTimeout(() => {
        try {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    } else {
      window.scrollTo(...topOfPage);
    }
  }

  // Handling previous path into local storage for "Back" arrow button
  if (prevRouterProps) {
    window.localStorage.setItem('previousPath', prevRouterProps.location.pathname);
  }

  return false;
};
export default shouldUpdateScroll;
