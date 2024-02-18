import type { FC } from 'react';
import { useMemo } from 'react';
import { PoweredBy, useStats } from 'react-instantsearch';
import useColorMode from '@hooks/useColorMode';
import { Kbd } from '@components/Keyboard';
import clsx from 'clsx';
import useRecentList from './useRecentList';
import { Icon } from '@iconify/react';

const hotKeys = [
  {
    keys: [<Icon icon="oui:return-key" />],
    text: '选择',
    showIn: {
      search: true,
      recent: true,
      always: false
    }
  },
  {
    keys: [<Icon icon="fa6-solid:arrow-up" />, <Icon icon="fa6-solid:arrow-down" />],
    text: '切换',
    showIn: {
      search: true,
      recent: true,
      always: false
    }
  },
  {
    keys: [<Icon icon="fa6-solid:delete-left" />],
    text: '删除',
    showIn: {
      search: false,
      recent: true,
      always: false
    }
  },
  {
    keys: [<Icon icon="vaadin:esc-a"/>],
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
        'border-palette-bgAlt border-t-[1px] border-solid px-6 py-4'
      )}
    >
      <PoweredBy
        theme={colorMode}
        classNames={{
          logo: 'h-[18px] mt-[3px] sm:h-3 md:h-4'
        }}
      />
      <div className="flex text-sm sm:hidden">
        {hotKeys.map(
          ({ keys, text }, i) =>
            showMap[i] && (
              <div key={text} className="mr-4 md:mr-2">
                {keys.map((key, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Kbd key={index}>{key}</Kbd>
                ))}{' '}
                <span className="md:text-xs">{text}</span>
              </div>
            )
        )}
      </div>
    </footer>
  );
};
export default Footer;
