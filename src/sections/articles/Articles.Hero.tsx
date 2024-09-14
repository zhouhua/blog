import { useContext } from 'react';
import type { FC } from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';
import clsx from 'clsx';
import Section from '@components/Section';
import Bio from '@components/Bio';
import Icons from '@icons';
import { RoughNotation } from 'react-rough-notation';
import { Icon } from '@iconify/react';
import { GridLayoutContext } from './Articles.List.Context';
import * as styles from './index.module.css';

const authorQuery = graphql`
  {
    site: allSite {
      edges {
        node {
          siteMetadata {
            subtitle
            hero {
              heading
              maxWidth
            }
          }
        }
      }
    }
    author: allAuthor {
      edges {
        node {
          authorsPage
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

const ArticlesHero: FC<{
  tag?: string;
  showLayout?: boolean;
  title?: string;
  description?: string;
}> = ({ tag, showLayout = false, title, description }) => {
  const { gridLayout = 'tiles', hasSetGridLayout, setGridLayout } = useContext(GridLayoutContext);

  const results = useStaticQuery<Queries.Query>(authorQuery);
  const { hero, subtitle } = results.allSite.edges[0].node.siteMetadata;
  const author: Queries.AuthorsYaml = results.allAuthorsYaml.edges[0].node;
  const tilesIsActive = hasSetGridLayout && gridLayout === 'tiles';

  return (
    <Section narrow className="relative">
      {tag
        ? (
            <div className="my-28 flex items-center justify-between sm:my-10 md:my-16">
              <h1
                className={clsx(
                  styles.HeroHeading,
                  'colorModeTransition text-[36px] font-semibold not-italic leading-[1.15]',
                  'text-palette-primary sm:text-[24px] md:text-[30px]',
                )}
              >
                关于
                <small>
                  <Icon
                    icon="heroicons:hashtag-solid"
                    className="ml-2 mr-1 text-palette-accent opacity-70"
                  />
                </small>
                <RoughNotation
                  show
                  type="underline"
                  animationDelay={800}
                  strokeWidth={2}
                  color="rgb(var(--color-accent))"
                >
                  {tag}
                </RoughNotation>
                {' '}
                的文章：
              </h1>
              <Link
                to="/articles"
                className="hover:text-palette-accent hover:underline hover:underline-offset-4 sm:hidden"
              >
                <Icon icon="fa6-solid:angle-right" className="mr-2" />
                所有文章
              </Link>
            </div>
          )
        : (
            <div
              className={clsx('mx-0 my-[100px] text-palette-primary sm:w-full md:w-4/5')}
              style={{ maxWidth: `${hero.maxWidth}px` }}
            >
              <h1
                className={clsx(
                  styles.HeroHeading,
                  'colorModeTransition text-[52px] font-semibold not-italic leading-[1.15]',
                  'mb-10 sm:text-[32px] md:text-[38px]',
                )}
              >
                {title || hero.heading}
              </h1>
              {!title && (
                <p className="colorModeTransition">
                  <RoughNotation
                    show
                    type="highlight"
                    animationDelay={800}
                    color="rgb(var(--color-accent) / 0.4)"
                  >
                    {subtitle}
                  </RoughNotation>
                </p>
              )}
              {description && (
                <p className="colorModeTransition">
                  <RoughNotation
                    show
                    type="highlight"
                    animationDelay={800}
                    color="rgb(var(--color-accent) / 0.4)"
                  >
                    {description}
                  </RoughNotation>
                </p>
              )}
            </div>
          )}
      <div className="mb-[100px] flex items-center justify-between sm:hidden md:mb-20">
        <Bio author={author} />
        {showLayout && (
          <div className="sm:hidden; flex items-center">
            <button
              type="button"
              className={clsx(styles.GridButton, { [styles.active]: tilesIsActive }, 'mr-[30px]')}
              data-a11y="false"
              title="Show articles in Tile grid"
              aria-label="Show articles in Tile grid"
              onClick={() => { setGridLayout!('tiles'); }}
            >
              <Icons.Tiles />
            </button>
            <button
              type="button"
              className={clsx(styles.GridButton, { [styles.active]: !tilesIsActive })}
              data-a11y="false"
              title="Show articles in Row grid"
              aria-label="Show articles in Row grid"
              onClick={() => { setGridLayout!('rows'); }}
            >
              <Icons.Rows />
            </button>
          </div>
        )}
      </div>
    </Section>
  );
};

export default ArticlesHero;
