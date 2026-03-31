import type { FC } from 'react';
import { cn } from '@lib/utils';
import { bindKeyCombo, unbindKeyCombo } from '@rwh/keystrokes';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UAParser } from 'ua-parser-js';
import Kbd from '../Keyboard';
import SearchPanel from './Panel';

export const SearchButton: FC<{ appId: string; appKey: string }> = ({ appId, appKey }) => {
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);
  const [isMac] = useState<boolean>(() => {
    const parser = new UAParser();
    return parser.getOS().name === 'Mac OS';
  });

  useEffect(() => {
    const searchKeyCombo = isMac ? 'Meta > k' : 'Control > k';
    const hotkeyHandler = {
      onPressed: () => setShowSearchPanel(true),
    };
    bindKeyCombo(searchKeyCombo, hotkeyHandler);
    return () => unbindKeyCombo(searchKeyCombo, hotkeyHandler);
  }, [isMac]);

  function hide() {
    setShowSearchPanel(false);
  }

  return (
    <>
      <div
        className={cn(
          'colorModeTransition',
          'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 p-2 text-2xl opacity-50',
          'sm:w-40 sm:justify-between sm:border sm:border-solid sm:border-gray sm:px-3 sm:text-sm sm:text-gray sm:opacity-100',
        )}
        onClick={() => {
          setShowSearchPanel(true);
        }}
      >
        <span className="flex items-center gap-1 sm:h-6">
          <Search className="inline-block" />
          <span className="hidden sm:inline"> 搜索</span>
        </span>
        <span className="hidden sm:flex">
          <Kbd>{isMac ? '⌘' : 'ctrl'}</Kbd>
          <Kbd>k</Kbd>
        </span>
      </div>
      {createPortal(
        <SearchPanel
          appId={appId}
          appKey={appKey}
          hide={hide}
          show={showSearchPanel}
        />,
        document.body,
      )}
    </>
  );
};
export default SearchButton;
