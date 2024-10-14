import { useEffect } from 'react';
import createGlobalStore from './createGlobalStore';

const storeKey = 'recentSearch';
const max = 5;
export interface IRecentItem {
  query: string;
  title: string;
  slug: string;
}
const useGlobalState = createGlobalStore<IRecentItem[]>(storeKey);

function useRecentList(init?: IRecentItem[]) {
  const [recentList = [], setRecentList] = useGlobalState(init);
  function updateRecentList(list: IRecentItem[] = []) {
    setRecentList(list.slice(0, max));
  }
  function addRecent(item: IRecentItem) {
    for (const { query, slug } of recentList) {
      if (slug === item.slug && query === item.query) {
        return;
      }
    }
    updateRecentList([item, ...recentList]);
  }
  function removeRecent(index: number) {
    if (index < recentList.length) {
      const newList = [...recentList];
      newList.splice(index, 1);
      updateRecentList(newList);
    }
  }
  function clearRencenList() {
    setRecentList([]);
  }
  useEffect(() => {}, [recentList]);
  return {
    addRecent,
    clearRencenList,
    recentList,
    removeRecent,
    updateRecentList,
  };
}
export default useRecentList;
