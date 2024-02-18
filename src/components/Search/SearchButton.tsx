import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { bindKeyCombo, unbindKeyCombo } from '@rwh/keystrokes';
import { Kbd } from '@components/Keyboard';
import { UAParser } from 'ua-parser-js';
import clsx from 'clsx';
import { Icon } from '@iconify/react';
import SearchPanel from './Panel';

const SearchButton: FC = () => {
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);
  const [isMac, setIsMac] = useState<boolean>(true);
  useEffect(() => {
    const parser = new UAParser();
    const isMacInner = parser.getOS().name === 'Mac OS';
    setIsMac(isMacInner);
    const searchKeyCombo = isMacInner ? 'Meta > k' : 'Control > k';
    const hotkeyHandler = {
      onPressed: () => setShowSearchPanel(true)
    };
    bindKeyCombo(searchKeyCombo, hotkeyHandler);
    return () => unbindKeyCombo(searchKeyCombo, hotkeyHandler);
  }, []);
  return (
    <>
      <div
        className={clsx(
          'colorModeTransition',
          'flex h-10 w-40 cursor-pointer items-center justify-between px-3 text-sm',
          'rounded-full border border-solid border-palette-gray',
          'bg-palette-bg text-palette-gray hover:text-palette-primary',
          'sm:w-10 sm:border-0 sm:bg-opacity-0 sm:p-2 sm:text-2xl sm:text-palette-primary sm:opacity-50'
        )}
        onClick={() => setShowSearchPanel(true)}
      >
        <span>
          <Icon icon="fa6-solid:magnifying-glass" />
          <span className="sm:hidden"> 搜索</span>
        </span>
        <span className="sm:hidden">
          <Kbd>{isMac ? '⌘' : 'ctrl'}</Kbd>
          <Kbd>k</Kbd>
        </span>
      </div>
      <SearchPanel show={showSearchPanel} hide={() => setShowSearchPanel(false)} />
    </>
  );
};
export default SearchButton;
