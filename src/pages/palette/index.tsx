import type { HeadFC, PageProps } from 'gatsby';
import { useRef, type FC, useState } from 'react';
import Layout from '@components/Layout';
import Section from '@components/Section';
import * as styles from './index.module.css';
import { useMount } from 'react-use';

const Index: FC<PageProps> = () => {
  const $root = useRef<HTMLElement|null>(null);
  const [pallete, setPallete] = useState<Record<string, string>>({});
  useMount(() => {
    $root.current = document.body;
    
  });
  return (
    <Layout>=
      <Section narrow>
        
      </Section>
    </Layout>
  );
};

export default Index;

export const Head: HeadFC = () => <title>周骅的博客</title>;
