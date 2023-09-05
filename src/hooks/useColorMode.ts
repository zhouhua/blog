import { useEffect } from 'react';
import { createGlobalState } from 'react-use';

type UseColorModeType = () => [ColorMode, (colorMode: ColorMode) => void];
// eslint-disable-next-line import/no-mutable-exports
let useColorMode: UseColorModeType = () => ['light', () => undefined];

const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const storeKey = 'colorMode';

  const setup = () => {
    let init = localStorage.getItem(storeKey) as ColorMode | null;
    if (!init) {
      init = darkModeQuery.matches ? 'dark' : 'light';
    }
    if (init === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    return init;
  };

  const useGlobalColorMode = createGlobalState<ColorMode>(setup());

  useColorMode = () => {
    const [colorMode, setColorMode] = useGlobalColorMode();

    function changeColorMode(newColorMode: ColorMode) {
      setColorMode(newColorMode);
      if (newColorMode === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      localStorage.setItem(storeKey, newColorMode);
    }

    useEffect(() => {
      function colorModeChangeHandler(e: MediaQueryListEvent) {
        changeColorMode(e.matches ? 'dark' : 'light');
      }
      darkModeQuery.addEventListener('change', colorModeChangeHandler);
    }, []);

    return [colorMode, changeColorMode];
  };
}

export default useColorMode;
