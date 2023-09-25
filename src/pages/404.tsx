import Layout from '@components/Layout';
import Section from '@components/Section';
import type { HeadFC } from 'gatsby';
import type { FC } from 'react';
import BrokenText from '@components/Text/BrokenText';
import { Link } from 'gatsby';

const NotFoundPage: FC = () => (
  <Layout>
    <Section narrow className="py-20">
      <BrokenText text="404" />
      <h1 className="text-palette-primary mt-20 text-center text-lg">找不到你访问的页面</h1>
      <div className="flex justify-center pt-10">
        <Link
          to="/"
          className="text-palette-primary hover:text-palette-accent p-2 underline-offset-4 hover:underline"
        >
          回到首页
        </Link>
      </div>
    </Section>
  </Layout>
);

export default NotFoundPage;

export const Head: HeadFC = () => <title>404 Not Found</title>;
