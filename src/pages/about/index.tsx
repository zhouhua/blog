import type { HeadFC, PageProps } from 'gatsby';
import { graphql, useStaticQuery } from 'gatsby';
import type { FC } from 'react';
import Layout from '@components/Layout';
import SEO from '@components/SEO';
import Section from '@components/Section';
import clsx from 'clsx';
import useSiteMetadata from '@hooks/useSiteMetaData';
import { StaticImage } from 'gatsby-plugin-image';
import Bio from '@components/Bio';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as styles from './index.module.css';

const authorQuery = graphql`
  {
    author: allAuthorsYaml {
      edges {
        node {
          bio
          id
          name
          featured
          social {
            url
          }
          avatar {
            childImageSharp {
              gatsbyImageData(
                layout: CONSTRAINED
                width: 100
                quality: 80
                placeholder: DOMINANT_COLOR
              )
            }
          }
        }
      }
    }
  }
`;

const Index: FC<PageProps> = ({ location }) => {
  const { title } = useSiteMetadata();
  const results = useStaticQuery(authorQuery);
  const author: Queries.AuthorsYaml = results.author.edges[0].node;
  return (
    <Layout>
      <SEO pathname={location.pathname} isBlogPost={false} title={title} />
      <Section narrow>
        <div className="relative mx-auto max-w-[640px]">
          <div
            className={clsx(
              styles.cardShadow,
              'absolute -top-5 left-1/2 z-[9] ml-[-18px] h-10 w-10 -translate-x-1/2 rounded-full'
            )}
          />
          <div
            className={clsx(
              'relative z-10 my-36 rounded-3xl',
              'bg-card dark:bg-dark-card',
              styles.card
            )}
          >
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <Bio author={author} hideText />
            </div>
            <article className={clsx('flex items-center justify-between px-8 py-6')}>
              <div className="flex h-80 flex-col justify-between leading-10">
                <div className="text-primary dark:text-dark-primary">
                  <h2 className="mb-4 mt-6 text-4xl">{author.name}</h2>
                  <a href="mailto:zhou--hua@163.com">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-3" />
                    zhou--hua@163.com
                  </a>
                </div>
                <div className="font-serif text-sm leading-6 text-secondary dark:text-dark-secondary">
                  想成为⼀个有趣的⼈。
                  <br />
                  爱⾜球，爱桌游，
                  <br />
                  爱美⻝，爱⽣活。
                  <br />
                  爱钻研技术，更爱⽤技术改变产品；
                  <br />
                  爱解决问题，更爱提出问题。
                </div>
              </div>
              <StaticImage
                className="rounded-lg"
                src="../../images/weixin.jpeg"
                alt="微信二维码"
                height={320}
                placeholder="blurred"
                layout="fixed"
              />
            </article>
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default Index;

export const Head: HeadFC = () => <title>周骅的博客</title>;
