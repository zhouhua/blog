import { useEffect } from 'react';
import { createGlobalState } from 'react-use';

const globalStoreCache = new Map();

type GlobalStoreHook<T> = (init?: T) => [T | undefined, (value: T) => void];

function createGlobalStore<T>(key: string, initValue?: T) {
  if (globalStoreCache.has(key)) {
    return globalStoreCache.get(key) as GlobalStoreHook<T>;
  }

  const useStore = createGlobalState<T | undefined>(() => {
    if (typeof initValue !== 'undefined') {
      return initValue;
    }
    try {
      return JSON.parse(localStorage.getItem(key) || '') as T;
    }
    catch (e) {
      return undefined;
    }
  });
  const useHook: GlobalStoreHook<T> = (init?: T) => {
    const [value, setValue] = useStore();
    function update(newValue: T) {
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
        setValue(newValue);
      }
      catch (e) {
        // do nothing
      }
    }
    useEffect(() => {
      if (typeof init !== 'undefined') {
        update(init as T);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {}, [value]);
    return [value, update];
  };
  globalStoreCache.set(key, useHook);
  return useHook;
}

export default createGlobalStore;
