import { useCallback, useEffect, useRef } from 'react';
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
  const $html = useRef<HTMLHtmlElement | null>(null);

  const changeHTMLBg = useCallback(
    (color: ColorMode) => {
      if ($html.current) {
        const bg: Record<ColorMode, string> = { light: '#f1f2f6', dark: '#2f3542' };
        $html.current.style.background = bg[color];
      }
    },
    [$html.current]
  );

  const applyChange = useCallback(
    (newColorMode: ColorMode) => {
      if (newColorMode === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      changeHTMLBg(newColorMode);
      localStorage.setItem(storeKey, newColorMode);
    },
    [changeHTMLBg]
  );

  const changeColorMode = useCallback(
    (newColorMode: ColorMode) => {
      setColorMode(newColorMode);
      applyChange(newColorMode);
    },
    [applyChange, setColorMode]
  );

  useEffect(() => {
    $html.current = document.querySelector('html')!;
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
