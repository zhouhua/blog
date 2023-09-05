import type { GatsbyBrowser } from 'gatsby';

const shouldUpdateScroll: GatsbyBrowser['shouldUpdateScroll'] = ({
  routerProps,
  prevRouterProps,
  getSavedScrollPosition
}) => {
  const currentPosition = getSavedScrollPosition(routerProps.location, routerProps.location.key);
  console.log(currentPosition);
  const topOfPage: [number, number] = [0, 0];

  if (routerProps.location.action === 'POP' && currentPosition) {
    window.scrollTo(...currentPosition);
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
      }, 200);
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
