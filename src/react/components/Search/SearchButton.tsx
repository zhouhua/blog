import type { FC } from 'react';
import { cn } from '@lib/utils';
import { bindKeyCombo, unbindKeyCombo } from '@rwh/keystrokes';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UAParser } from 'ua-parser-js';
import Kbd from '../Keyboard';
import SearchPanel from './Panel';

export const SearchButton: FC<{ appId: string; appKey: string }> = ({ appId, appKey }) => {
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);
  const [isMac, setIsMac] = useState<boolean>(true);
  useEffect(() => {
    const parser = new UAParser();
    const isMacInner = parser.getOS().name === 'Mac OS';
    setIsMac(isMacInner);
    const searchKeyCombo = isMacInner ? 'Meta > k' : 'Control > k';
    const hotkeyHandler = {
      onPressed: () => setShowSearchPanel(true),
    };
    bindKeyCombo(searchKeyCombo, hotkeyHandler);
    return () => unbindKeyCombo(searchKeyCombo, hotkeyHandler);
  }, []);

  function hide() {
    setShowSearchPanel(false);
  }

  return (
    <div
      className={cn(
        'colorModeTransition',
        'flex h-10 w-40 cursor-pointer items-center justify-between px-3 text-sm',
        'rounded-full border border-solid border-palette-gray text-palette-gray',
        'md:w-28',
        'sm:w-10 sm:border-0 sm:p-2 sm:text-2xl sm:text-palette-primary sm:opacity-50',
      )}
      onClick={() => {
        setShowSearchPanel(true);
      }}
    >
      <span className="sm:h-6 flex items-center gap-1">
        <span className="iconify fa6-solid--magnifying-glass" />
        <span className="sm:hidden md:hidden"> 搜索</span>
      </span>
      <span className="sm:hidden">
        <Kbd>{isMac ? '⌘' : 'ctrl'}</Kbd>
        <Kbd>k</Kbd>
      </span>
      {createPortal(
        <SearchPanel
          appId={appId}
          appKey={appKey}
          hide={hide}
          show={showSearchPanel}
        />,
        document.body,
      )}
    </div>
  );
};
export default SearchButton;
