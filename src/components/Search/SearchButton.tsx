import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { bindKeyCombo, unbindKeyCombo } from '@rwh/keystrokes';
import { Kbd } from '@components/Keyboard';
import { UAParser } from 'ua-parser-js';
import clsx from 'clsx';
import SearchPanel from './Panel';
import { HydrationProvider, useHydrated } from 'react-hydration-provider';

const parser = new UAParser();
export const isMac = parser.getOS().name === 'Mac OS';

export const searchKeyCombo = isMac ? 'Meta > k' : 'Control > k';

const SearchButton: FC = () => {
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);
  useEffect(() => {
    const hotkeyHandler = {
      onPressed: () => setShowSearchPanel(true)
    };
    bindKeyCombo(searchKeyCombo, hotkeyHandler);
    return () => unbindKeyCombo(searchKeyCombo, hotkeyHandler);
  }, []);
  const hydrated = useHydrated();
  return (
    <HydrationProvider>
      <div
        className={clsx(
          'colorModeTransition',
          'flex h-10 w-40 cursor-pointer items-center justify-between px-3 text-sm',
          'rounded-full border border-solid border-grey dark:border-dark-grey',
          'bg-card text-grey dark:bg-dark-card dark:text-dark-grey',
          'hover:text-primary hover:dark:text-dark-primary',
          'sm:w-10 sm:border-0 sm:bg-opacity-0 sm:p-2 sm:text-2xl sm:opacity-50 sm:hover:opacity-100'
        )}
        onClick={() => setShowSearchPanel(true)}
      >
        <span>
          <i className="fa-solid fa-magnifying-glass" />
          <span className="sm:hidden"> 搜索</span>
        </span>
        <span className="sm:hidden">
          <Kbd>{isMac && hydrated ? '⌘' : 'ctrl'}</Kbd>
          <Kbd>k</Kbd>
        </span>
      </div>
      <SearchPanel show={showSearchPanel} hide={() => setShowSearchPanel(false)} />
    </HydrationProvider>
  );
};
export default SearchButton;
