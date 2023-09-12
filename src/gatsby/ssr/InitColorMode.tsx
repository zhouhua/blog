import type { FC } from 'react';

const code = `
(function () {
  const storeKey = 'colorMode';
  let init = localStorage.getItem(storeKey);
  if (!init) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    init = darkModeQuery.matches ? 'dark' : 'light';
    localStorage.setItem
  }
  if (init === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
})();
`;

const InitColorMode: FC = () => <script dangerouslySetInnerHTML={{ __html: code }} />;
export default InitColorMode;
