import type { GatsbyBrowser } from 'gatsby';

function handleAccessibilityFocus() {
  const elementsWithA11yFocus = Array.from(document.querySelectorAll('[data-a11y]'));
  document.addEventListener('keyup', event => {
    elementsWithA11yFocus.forEach(element => {
      if (element === event.target || element.contains(event.target as Node)) {
        element.setAttribute('data-a11y', 'true');
      } else {
        element.setAttribute('data-a11y', 'false');
      }
    });
  });

  // On mouse click change data-a11y attribute false
  document.addEventListener('mousedown', event => {
    elementsWithA11yFocus.forEach(element => {
      if (element === event.target || element.contains(event.target as Node)) {
        element.setAttribute('data-a11y', 'false');
      }
    });
  });
}

const onInitialClientRender: GatsbyBrowser['onInitialClientRender'] = () => {
  localStorage.removeItem('previousPath');

  setTimeout(() => {
    handleAccessibilityFocus();
  }, 1000);

  // dirty fix for missing popstate listener
  // @ts-ignore
  const GATSBY_NAVIGATE = window.___navigate || {}; // eslint-disable-line

  window.addEventListener('popstate', () =>
    GATSBY_NAVIGATE(window.location.pathname, { replace: true }));
};

export default onInitialClientRender;
