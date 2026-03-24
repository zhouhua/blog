import * as React from 'react';

export const MOBILE_BREAKPOINT = 640;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function getSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
  const handleChange = () => {
    onStoreChange();
  };

  mql.addEventListener('change', handleChange);
  return () => mql.removeEventListener('change', handleChange);
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
