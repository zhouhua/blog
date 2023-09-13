import type { FC } from 'react';
import { useMemo } from 'react';
import { PoweredBy, useStats } from 'react-instantsearch';
import useColorMode from '@hooks/useColorMode';
import { Kbd } from '@components/Keyboard';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faArrowTurnDown,
  faDeleteLeft
} from '@fortawesome/free-solid-svg-icons';
import useRecentList from './useRecentList';

const hotKeys = [
  {
    keys: [<FontAwesomeIcon icon={faArrowTurnDown} rotation={90} />],
    text: '选择',
    showIn: {
      search: true,
      recent: true,
      always: false
    }
  },
  {
    keys: [<FontAwesomeIcon icon={faArrowUp} />, <FontAwesomeIcon icon={faArrowDown} />],
    text: '切换',
    showIn: {
      search: true,
      recent: true,
      always: false
    }
  },
  {
    keys: [<FontAwesomeIcon icon={faDeleteLeft} />],
    text: '删除',
    showIn: {
      search: false,
      recent: true,
      always: false
    }
  },
  {
    keys: ['ESC'],
    text: '退出',
    showIn: {
      search: true,
      recent: true,
      always: true
    }
  }
];
const Footer: FC = () => {
  const [colorMode] = useColorMode();
  const { nbHits, query } = useStats();
  const { recentList } = useRecentList();
  const showSearchKey = !!nbHits && !!query;
  const showRecentKey = !query && !!recentList.length;

  const showMap = useMemo<boolean[]>(
    () =>
      hotKeys.map(
        ({ showIn }) =>
          showIn.always || (showIn.search && showSearchKey) || (showIn.recent && showRecentKey)
      ),
    [showRecentKey, showSearchKey]
  );

  return (
    <footer
      className={clsx(
        'flex flex-row-reverse justify-between',
        'border-t-[1px] border-solid border-horizontalRule px-6 py-4 dark:border-dark-horizontalRule'
      )}
    >
      <PoweredBy
        theme={colorMode}
        classNames={{
          logo: 'h-[18px] mt-[3px]'
        }}
      />
      <div className="flex text-sm ">
        {hotKeys.map(
          ({ keys, text }, i) =>
            showMap[i] && (
              <div key={text} className="mr-4">
                {keys.map((key, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Kbd key={index}>{key}</Kbd>
                ))}{' '}
                {text}
              </div>
            )
        )}
      </div>
    </footer>
  );
};
export default Footer;
