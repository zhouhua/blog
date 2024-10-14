import type { FC } from 'react';
import Giscus from '@giscus/react';
import useColorMode from '@react/hooks/useColorMode';

const Comment: FC = () => {
  const [colorMode] = useColorMode();
  return (
    <div
      className="relative z-10 mb-32 mt-10 border-t border-solid border-palette-bgAlt pt-10"
    >
      <div className="mx-auto max-w-[680px]">
        <Giscus
          key={colorMode}
          category="Announcements"
          categoryId="DIC_kwDOB2WHq84CZHl_"
          emitMetadata="0"
          inputPosition="top"
          lang="zh-CN"
          loading="lazy"
          mapping="title"
          reactionsEnabled="1"
          repo="zhouhua/blog-comment"
          repoId="MDEwOlJlcG9zaXRvcnkxMjQwOTQzNzk="
          strict="0"
          theme={`${colorMode}_protanopia`}
        />
      </div>
    </div>
  );
};
export default Comment;
