import type { PropsWithChildren } from 'react';
import React, { createContext, useMemo, useState } from 'react';

export type GridLayout = 'tiles' | 'rows';

interface GridLayoutContextType {
  gridLayout: GridLayout;
  hasSetGridLayout: boolean;
  setGridLayout?: (layout: GridLayout) => void;
  getGridLayout?: () => GridLayout;
}

export const GridLayoutContext = createContext<GridLayoutContextType>({
  gridLayout: 'tiles',
  hasSetGridLayout: false
});

const GridLayoutProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const initialLayout: GridLayout = 'tiles';

  const [gridLayout, setGridLayout] = useState<GridLayout>(initialLayout);
  const [hasSetGridLayout, setHasSetGridLayout] = useState<boolean>(false);

  function setGridLayoutAndSave(tile: GridLayout) {
    localStorage.setItem('gridLayout', tile || initialLayout);
    setGridLayout(tile);
  }

  function getGridLayoutAndSave() {
    const layout = (localStorage.getItem('gridLayout') as GridLayout) || initialLayout;
    setGridLayout(layout);
    setHasSetGridLayout(true);
    return layout;
  }

  const gridLayoutContext = useMemo(() => {
    return {
      gridLayout,
      hasSetGridLayout,
      setGridLayout: setGridLayoutAndSave,
      getGridLayout: getGridLayoutAndSave
    };
  }, [gridLayout, hasSetGridLayout, setGridLayoutAndSave, getGridLayoutAndSave]);

  return (
    <GridLayoutContext.Provider value={gridLayoutContext}>{children}</GridLayoutContext.Provider>
  );
};

export default GridLayoutProvider;
