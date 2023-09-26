import Section from '@components/Section';
import Giscus from '@giscus/react';
import useColorMode from '@hooks/useColorMode';
import type { FC } from 'react';

const Comment: FC = () => {
  const [colorMode] = useColorMode();
  return (
    <Section
      narrow
      className="relative z-10 mb-32 mt-10 border-t border-solid border-palette-bgAlt pt-10"
    >
      <div className="mx-auto max-w-[680px]">
        <Giscus
          key={colorMode}
          repo="zhouhua/blog-comment"
          repoId="MDEwOlJlcG9zaXRvcnkxMjQwOTQzNzk="
          category="Announcements"
          categoryId="DIC_kwDOB2WHq84CZHl_"
          mapping="title"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={`${colorMode}_protanopia`}
          lang="zh-CN"
          loading="lazy"
        />
      </div>
    </Section>
  );
};
export default Comment;
