import type { FC } from 'react';
import { useStats } from 'react-instantsearch';

const NoResult: FC = () => {
  const { processingTimeMS, query } = useStats();
  return (
    <div className="text-palette-gray px-6 py-16 text-center">
      没有关于
      <span className="text-palette-secondary px-1.5">{query}</span>
      的搜索结果，耗时
      {' '}
      {processingTimeMS}
      ms。
    </div>
  );
};
export default NoResult;
