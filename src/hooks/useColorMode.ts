import { useCallback, useEffect } from 'react';
import { createGlobalState } from 'react-use';

type UseColorModeType = () => [ColorMode, (colorMode: ColorMode) => void];

const storeKey = 'colorMode';

const setup = () =>
  typeof window === 'undefined'
    ? 'light'
    : ((localStorage.getItem(storeKey) || 'light') as ColorMode);

const useGlobalColorMode = createGlobalState<ColorMode>(setup());

const useColorMode: UseColorModeType = () => {
  const [colorMode, setColorMode] = useGlobalColorMode();

  const applyChange = useCallback((newColorMode: ColorMode) => {
    if (newColorMode === 'dark') {
      document.querySelector('html')!.classList.add('dark');
    } else {
      document.querySelector('html')!.classList.remove('dark');
    }
    localStorage.setItem(storeKey, newColorMode);
  }, []);

  const changeColorMode = useCallback(
    (newColorMode: ColorMode) => {
      setColorMode(newColorMode);
      applyChange(newColorMode);
    },
    [applyChange, setColorMode]
  );

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    function colorModeChangeHandler(e: MediaQueryListEvent) {
      changeColorMode(e.matches ? 'dark' : 'light');
    }
    darkModeQuery.addEventListener('change', colorModeChangeHandler);
  }, [changeColorMode]);

  useEffect(() => {
    applyChange(colorMode);
  }, []);

  return [colorMode, changeColorMode];
};

export default useColorMode;
