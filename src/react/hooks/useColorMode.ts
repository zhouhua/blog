import { useCallback, useEffect } from 'react';
import { createGlobalState } from 'react-use';

type UseColorModeType = () => [ColorMode, (colorMode: ColorMode) => void];

const storeKey = 'colorMode';

function setup() {
  return typeof window === 'undefined'
    ? 'light'
    : ((localStorage.getItem(storeKey) || 'light') as ColorMode);
}

function applyChange(newColorMode: ColorMode) {
  if (newColorMode === 'dark') {
    document.querySelector('html')!.classList.add('dark');
  }
  else {
    document.querySelector('html')!.classList.remove('dark');
  }
  localStorage.setItem(storeKey, newColorMode);
}

const useGlobalColorMode = createGlobalState<ColorMode>(setup());

const useColorMode: UseColorModeType = () => {
  const [colorMode, setColorMode] = useGlobalColorMode();

  const changeColorMode = useCallback(
    (newColorMode: ColorMode) => {
      setColorMode(newColorMode);
      applyChange(newColorMode);
    },
    [setColorMode],
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
  }, [colorMode]);

  return [colorMode, changeColorMode];
};

export default useColorMode;
